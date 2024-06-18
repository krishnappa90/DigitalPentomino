/**
 * This class is used to create and interact with the settings-html element and it's sub-elements.
 *
 * Central methods:
 * - {@link SettingsForm#generateForm} to generate a new SettingsForm.
 * - {@link SettingsForm#updateForm} to populate SettingsForm with values.
 */
class SettingsForm {

    // === === === GENERATE FORM === === ===
    /**
     * Creates a new Settings Form element. The settings form is generated based on the current settings schema.
     * The function expects a formElement parameter, which is the root element under which the form will be
     * generated.
     *
     * Furthermore, two callback methods need to be implement: onSubmit and onLicense.
     *
     * @param formElement root element, under which settings-form is generated
     * @param onSubmit The form contains a button to submit the settings. This function is called when this button is pressed.
     * @param onLicense The form contains a button to open the licenses menu. This function is  called when this button is pressed.
     */
    static generateForm(formElement, onSubmit, onLicense) {
        let schema = SettingsSchemaSingleton.getInstance().getSettingsSchema();
        let settings = SettingsSingleton.getInstance().getSettings();

        SettingsForm.createForm(formElement, schema, settings);

        formElement.appendChild(document.createElement("br"));
        formElement.appendChild(document.createElement("br"));
        let licenseButton = SettingsForm.createLicenseButton();
        licenseButton.id = "licenseButton";
        licenseButton.className = "formButton"
        formElement.appendChild(SettingsForm.createSubmitButton());
        formElement.appendChild(licenseButton);

        $(formElement).submit(function(event) {
            let schema = SettingsSchemaSingleton.getInstance().getSettingsSchema();
            let settings = SettingsSingleton.getInstance().getSettings();
            let settingsClone = SettingsForm.collectDataFromForm(formElement, schema, settings);
            // console.log(settingsClone);
            event.preventDefault();
            onSubmit(false, settingsClone);
            if ($('#birdContainer').is(':visible')){
                document.getElementById('bubbleContainer').style.display = "block";
            }
        });
        licenseButton.addEventListener("click", () => onLicense());

        //add placeholder div at bottom of settings
        let placeholder = document.createElement("div");
        placeholder.id = "divPlaceholder";
        formElement.appendChild(placeholder);
        SettingsForm.addDifficultyLevelsListener(formElement);
    }

    // --- --- --- Form Creation --- --- ---
    static createForm(formElement, schema, settings) {
        let creatingNormalSettings = true;
        let advancedSettingsDiv = document.createElement("div");
        advancedSettingsDiv.style.display = "none";
        advancedSettingsDiv.id = "advancedSettings";

        let htmlElement = formElement;

        for (let heading in schema) {
            let subSettings = schema[heading].properties;

            let headingIsVisible = (settings.teachersMode || settings.visibility.isVisible(heading))
                && !(schema[heading].visible === false);

            if (headingIsVisible && creatingNormalSettings && schema[heading].advanced) {
                creatingNormalSettings = false;
                htmlElement = advancedSettingsDiv;

                let lang = settings.general.language;

                let advancedSettingsButton = SettingsForm.createCollapsibleButton(
                    strings.settings.advanced.show[lang],
                    strings.settings.advanced.hide[lang]);
                formElement.appendChild(advancedSettingsButton);
            }


            if (headingIsVisible) {
                htmlElement.appendChild(SettingsForm.createHeader("h3", schema[heading].title));
                htmlElement.appendChild(document.createElement("br"));
            }

            for (let key in subSettings) {
                let elementName = heading + "." + key;

                let settingsEntry = subSettings[key];
                let settingsEntryType = settingsEntry.type;

                if (heading === "prefilling" && key == "distanceValue" && settings.hasOwnProperty("prefilling") &&
                    settings.prefilling.hasOwnProperty("prefillingStrategy")) {
                    let strat = settings.prefilling.prefillingStrategy;
                    settingsEntry.enumText = settingsEntry._enumText[strat];
                }

                let elementIsVisible = (settings.teachersMode || settings.visibility.isVisible(heading, key))
                    && !(schema[heading].properties[key].visible === false);

                let div = document.createElement("div");
                div.style.display = elementIsVisible ? "block" : "none";
                htmlElement.appendChild(div);

                switch (settingsEntryType) {
                    case "boolean":
                        let checkbox = SettingsForm.createInputElement("checkbox", elementName);
                        div.appendChild(checkbox);
                        let label = SettingsForm.createLabel(settingsEntry.title, {
                            for: checkbox.id
                        });
                        div.appendChild(label);
                        break;
                    case "string":
                        let selectElementLabel = SettingsForm.createLabel(settingsEntry.title);
                        div.appendChild(selectElementLabel);
                        if (settingsEntry.imgPaths === undefined) {
                            let selectElement = SettingsForm.createSelectElement(
                                elementName,
                                settingsEntry.enum,
                                settingsEntry.enumText);
                            div.appendChild(selectElement);
                        } else {
                            let imgElement = SettingsForm.createImgSelectElement(
                                elementName,
                                settingsEntry.enum,
                                settingsEntry.enumText,
                                settingsEntry.imgPaths
                            );
                            div.appendChild(imgElement);
                        }
                        break;
                    case "integer":
                        let integerInputElementLabel = SettingsForm.createLabel(settingsEntry.title);
                        div.appendChild(integerInputElementLabel);
                        let integerInputElement = SettingsForm.createInputElement("number", elementName, {
                            step: 1,
                            value: settingsEntry.defaultValue,
                            min: settingsEntry.minimum,
                            max: settingsEntry.maximum
                        });
                        div.appendChild(integerInputElement);
                        break;
                    case "number":
                        let numberInputElementLabel = SettingsForm.createLabel(settingsEntry.title);
                        div.appendChild(numberInputElementLabel);
                        let numberInputElement = SettingsForm.createInputElement("number", elementName, {
                            step: 0.1,
                            value: settingsEntry.defaultValue,
                            min: settingsEntry.minimum,
                            max: settingsEntry.maximum
                        });
                        div.appendChild(numberInputElement);
                        break;
                    case "custom":
                        let customInputElementLabel = SettingsForm.createLabel(settingsEntry.title);
                        div.appendChild(customInputElementLabel);
                        let customSettingsEntry = CustomSettingsEntrySingleton.getInstance().get(heading, key);
                        let customSettingsElement = customSettingsEntry.create(settingsEntry);
                        div.appendChild(customSettingsElement);
                        break;
                    default:
                        throw new Error("Unknown type: " + settingsEntryType);
                }

                if (!(settingsEntry.description === undefined)) {
                    div.appendChild(document.createElement("br"));
                    let descriptionLabel = SettingsForm.createLabel(settingsEntry.description);
                    div.appendChild(descriptionLabel);
                }
                div.appendChild(document.createElement("br"));
            }
        }

        if (settings.teachersMode) {
            let lang = SettingsSingleton.getInstance().getSettings().general.language;
            htmlElement.appendChild(SettingsForm.createHeader("h3", strings.settings.visibilitySettings[lang]));
            htmlElement.appendChild(SettingsForm.createTeachersAdvancedSettings(formElement, schema));
        }

        formElement.appendChild(advancedSettingsDiv);

        SettingsForm.addDynamicBehaviorOfSettingsForm(formElement, settings);
    }

    // Dynamic Behavior
    static addDynamicBehaviorOfSettingsForm(formElement, settings) {
        //if (settings.visibility.isVisible("hinting", "hintingLevels") === true)
            //SettingsForm.addDifficultyLevelsListener(formElement);
        // if (settings.visibility.isVisible("prefilling", "distanceValue") === true)
        SettingsForm.addPrefillChangeListener();
        // further modifications of behavior
    }

   

    static addPrefillChangeListener() {
        let prefillStratSelectElem = document.getElementById("prefilling.prefillingStrategy");

        prefillStratSelectElem.addEventListener("change", (evt) => {
            let distValSelectElem = document.getElementById("prefilling.distanceValue");
            let schema = SettingsSchemaSingleton.getInstance().getSettingsSchema();
            let enumTexts = strings.settings.prefilling.distanceValue.enumTitles[evt.target.value];
            let enumElements = schema.prefilling.properties.distanceValue.enum;

            //Remove the existing elements in the lsit
            for(let i = distValSelectElem.options.length -1; i >= 0; --i) {
                distValSelectElem.remove(i);
            }

            for (let i = 0; i < enumElements.length; i++) {
                let optionElement = document.createElement("option");
                optionElement.innerHTML = enumTexts[i];
                optionElement.value = enumElements[i];
                distValSelectElem.appendChild(optionElement);
            }
        });
    }

    static addDifficultyLevelsListener(formElement) {
      $( "select[name='general.hintingLevels']" ).change(function() {
            let select = event.target;
            let selectedOption = select.options[select.selectedIndex];
            let value = selectedOption.getAttribute('value');
            switch (value) {
                  case "Easy":
                      //activate full hint
                      $('select[name="hinting.hintingStrategy"]').find('option[value="full"]').attr("selected", true);
                      //check exact hints
                      $("input[name='hinting.exactHints']").prop('checked', true);
                      //uncheck partial hinting
                      $("input[name='teachers.hinting.partialHintingStragety']").prop('checked', false);
                      //enable prefilling
                      $("input[name='prefilling.enablePrefilling']").prop('checked', true);
                      //check hintingVariants
                      $("input[name='teachers.hinting.hintingVariants']").prop('checked', true);
                      //enable both hinting hintingVariants
                      $("input[name='hinting.hintingVariants']").find('option[value="Show both"]').attr("selected", true);
                      break;
                  case "Medium":
                      //activate area hint
                      $('select[name="hinting.hintingStrategy"]').find('option[value="area"]').attr("selected", true);
                      //uncheck exact hints
                      $("input[name='hinting.exactHints']").prop('checked', false);
                      break;
                  case "Difficult":
                      //activate partial hint
                      $('select[name="hinting.hintingStrategy"]').find('option[value="partial"]').attr("selected", true);
                      //disable prefilling
                      $("input[name='prefilling.enablePrefilling']").prop('checked', false);
                      //uncheck exact hints
                      $("input[name='hinting.exactHints']").prop('checked', false);
                      //check partial hinting strategy
                      $("input[name='teachers.hinting.partialHintingStragety']").prop('checked', true);
                      break;
                  case "Custom": return;
                       break;
                default:
                    console.log("Level unknown");
            }
        });
    }

    // Element Creation
    static createCollapsibleButton(showText, hideText) {
        let buttonElement = SettingsForm.createButton(showText, {
            "class": "collapsible btn btn-primary btn-lg"
        });
        buttonElement.setAttribute("id", "showAdvanceSettingsBtn")

        buttonElement.addEventListener("click", function(event) {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
                buttonElement.innerHTML = showText;
            } else {
                content.style.display = "block";
                buttonElement.innerHTML = hideText;
            }
        });

        return buttonElement;
    }

    static createTeachersAdvancedSettings(formElement, schema) {
        let useInClassElement = document.createElement("div");

        for (let heading in schema) {
            let subSettings = schema[heading].properties;
            let headingIsVisible = !(schema[heading].visible === false);

            if (headingIsVisible) {
                useInClassElement.appendChild(SettingsForm.createHeader("h4", schema[heading].title));
            }

            for (let key in subSettings) {
                let elementName = heading + "." + key;

                let settingsEntry = subSettings[key];
                let elementIsVisible = !(subSettings[key].visible === false);

                let checkBoxElement = SettingsForm.createInputElement("checkbox", "teachers." + elementName);
                checkBoxElement.style.display = elementIsVisible ? "" : "none";
                useInClassElement.appendChild(checkBoxElement);

                if (elementIsVisible) {
                    useInClassElement.appendChild(SettingsForm.createLabel(settingsEntry.title, { for: checkBoxElement.id }));
                    useInClassElement.appendChild(document.createElement("br"));
                }
            }
        }

        return useInClassElement;
    }

    static createHeader(type, text) {
        let header = document.createElement(type);
        header.innerHTML = text;
        return header;
    }

    static createInputElement(type, name, options) {
        let inputElement = document.createElement("input");
        inputElement.setAttribute("type", type);
        inputElement.name = name;
        inputElement.id = name;

        if (!(options === undefined)) {
            for (let [key, value] of Object.entries(options)) {
                inputElement.setAttribute(key, value);
            }
        }

        // Custom error messages
        if (type === "number") {
            let lang = SettingsSingleton.getInstance().getSettings().general.language;

            inputElement.addEventListener('invalid', (event) => {
                if (event.target.validity.rangeUnderflow) {
                    event.target.setCustomValidity(strings.settings.errors.lowerThanMin[lang] + " " + options.min);
                } else if (event.target.validity.rangeOverflow) {
                    event.target.setCustomValidity(strings.settings.errors.higherThanMax[lang] + " " + options.max);
                } else if (event.target.validity.badInput) {
                    event.target.setCustomValidity(strings.settings.errors.numberBadInput[lang]);
                }
            });

            inputElement.addEventListener('change', (event) => {
                event.target.setCustomValidity('');
            });
        }

        return inputElement;
    }

    static createLabel(text, options) {
        let labelElement = document.createElement("label");
        labelElement.innerHTML = text;

        if (!(options === undefined)) {
            for (let [key, value] of Object.entries(options)) {
                labelElement.setAttribute(key, value);
            }
        }

        return labelElement;
    }

    static createImg(id, src, options) {
        let imgElement = document.createElement("img");
        imgElement.id = id;
        imgElement.src = src;

        if (!(options === undefined)) {
            for (let [key, value] of Object.entries(options)) {
                imgElement.setAttribute(key, value);
            }
        }

        return imgElement;
    }

    static createSelectElement(name, enumElements, enumTexts) {
        let selectElement = document.createElement("select");
        selectElement.name = name;
        selectElement.id = name;

        for (let i = 0; i < enumElements.length; i++) {
            let optionElement = document.createElement("option");
            optionElement.innerHTML = enumTexts[i];
            optionElement.value = enumElements[i];
            selectElement.appendChild(optionElement);
        }

        return selectElement;
    }

    static createImgSelectElement(name, enumElements, enumTexts, imgPaths) {
        let div = document.createElement("div");
        div.value = enumElements[0];
        div.setAttribute("name", name);
        div.id = name;

        let i = 0;
        imgPaths.forEach(imgPath => {
            let buttonElement = SettingsForm.createButton(undefined, {
                style: "background:url(" + imgPath + ");background-size: 100%;", class: "imgButton"
            });

            let enumElement = enumElements[i];
            buttonElement.addEventListener("click", (event) => {
                div.childNodes.forEach(childNode => childNode.classList.remove("selected"));
                div.value = enumElement;
                if (buttonElement.classList.contains("selected")) {
                    buttonElement.classList.remove("selected");
                } else {
                    buttonElement.classList.add("selected");
                }
            });
            div.appendChild(buttonElement);
            i++;
        });

        return div;
    }

    static createButton(text, options) {
        let buttonElement = document.createElement("button");
        buttonElement.type = "button";
        if (!(text === undefined)) buttonElement.innerHTML = text;

        if (!(options === undefined)) {
            for (let [key, value] of Object.entries(options)) {
                buttonElement.setAttribute(key, value);
            }
        }

        return buttonElement;
    }

    static createSubmitButton() {
        return SettingsForm.createButton("Submit", {
            type: "submit",
            class: "formButton",
            id: "btnSettingsSubmit"
        });
    }

    static createLicenseButton() {
        return SettingsForm.createButton("Licenses", {
            type: "button"
        });
    }

    static generateSettingsEntryName(heading, subheading) {
        return heading + "_" + subheading;
    }

    // --- --- --- Data Collection --- --- ---
    static collectDataFromForm(formElement, schema, settings) {

        let result = jQuery.extend(true, {}, settings);
        result.visibility = jQuery.extend(true, new SettingsVisibility(), settings.visibility);

        for (let heading in schema) {
            let subSettings = schema[heading].properties;
            for (let key in subSettings) {

                let name = heading + "." + key;

                let settingsEntry = subSettings[key];
                let settingsEntryType = settingsEntry.type;
                switch (settingsEntryType) {
                    case "boolean":
                        let checkBoxElement = $(formElement).find("input[name='" + name + "']")[0];
                        result[heading][key] = checkBoxElement.checked;
                        break;
                    case "string":
                        if (settingsEntry.imgPaths === undefined) {
                            let selectElement = $(formElement).find("select[name='" + name + "']")[0];
                            result[heading][key] = selectElement.value;
                        } else {
                            let divElement = $(formElement).find("div[name='" + name + "']")[0];
                            result[heading][key] = divElement.value;
                        }
                        break;
                    case "integer":
                        let integerInputElement = $(formElement).find("input[name='" + name + "']")[0];
                        result[heading][key] = parseInt(integerInputElement.value);
                        break;
                    case "number":
                        let numberInputElement = $(formElement).find("input[name='" + name + "']")[0];
                        result[heading][key] = parseFloat(numberInputElement.value);
                        break;
                    case "custom":
                        let customSettingsEntry = CustomSettingsEntrySingleton.getInstance().get(heading, key);
                        result[heading][key] = customSettingsEntry.collect(formElement);
                        break;
                    default:
                        throw new Error("Unknown type: " + settingsEntryType);
                }
            }
        }

        if (settings.teachersMode) {
            for (let heading in schema) {
                let subSettings = schema[heading].properties;
                for (let subheading in subSettings) {
                    let inputElement = $("input[name='teachers." + heading + "." + subheading + "']")[0];
                    result.visibility.setVisible(heading, subheading, inputElement.checked);
                }
            }
        }

        return result;
    }

    // === === === UPDATE FORM === === ===
    /**
     * The settings form can be populated with new values. The values are expected to be a settings-object, which can
     * be accessed with the {@link Settings}.
     *
     * Based on the type of the value defined in {@link SettingsSchema}, the different elements are changed.
     *
     * @param formElement
     * @param settings
     */
    static updateForm(formElement, settings) {
        let schema = SettingsSchemaSingleton.getInstance().getSettingsSchema();

        for (let heading in schema) {
            let subSettings = schema[heading].properties;
            for (let subheading in subSettings) {
                let schemaEntry = schema[heading]["properties"][subheading];
                switch (schemaEntry.type) {
                    case "boolean":
                        SettingsForm.editBooleanSchemaEntry(heading, subheading, settings[heading][subheading], formElement);
                        break;
                    case "number":
                    case "integer":
                        SettingsForm.editInputSchemaEntry(heading, subheading, settings[heading][subheading], formElement);
                        break;
                    case "string":
                        if (schemaEntry.imgPaths === undefined) {
                            SettingsForm.editStringSchemaEntry(heading, subheading, schemaEntry, settings[heading][subheading], formElement);
                        } else {
                            SettingsForm.updateImgSelectElement(heading, subheading, schemaEntry, settings[heading][subheading], formElement);
                        }
                        break;
                    case "custom":
                        let customSettingsEntry = CustomSettingsEntrySingleton.getInstance().get(heading, subheading);
                        customSettingsEntry.update(heading, subheading, schemaEntry, settings[heading][subheading], formElement);
                        break;
                    default:
                        throw new Error("Schema Error: Unknown type: " + schemaEntry.type);
                }
            }
        }

        if (settings.teachersMode) {
            for (let heading in schema) {
                let subSettings = schema[heading].properties;
                for (let subheading in subSettings) {
                    let inputElement = $("input[name='teachers." + heading + "." + subheading + "']")[0];
                    inputElement.checked = settings.visibility.isVisible(heading, subheading);
                }
            }
        }
    }

    static editBooleanSchemaEntry(heading, key, value, formElement) {
        let name = heading + "." + key;
        let inputElement = $(formElement).find("input[name='" + name + "']")[0];
        inputElement.checked = value;
    }

    static editInputSchemaEntry(heading, key, value, formElement) {
        let name = heading + "." + key;
        let inputElement = $(formElement).find("input[name='" + name + "']")[0];
        inputElement.value = value;
    }

    static editStringSchemaEntry(heading, key, schemaEntry, selectedValue, formElement) {
        let selectName = heading + "." + key;
        let enumText = schemaEntry.enumText;
        if (enumText === undefined) {
            throw new Error("No enumText defined");
        }
        let selectElement = $(formElement).find("select[name='" + selectName + "']")[0];
        if (!(selectElement.options.length === enumText.length)) {
            throw new Error("Number of elements does not match number of texts specified in enumText");
        }

        if (heading === "general" && key === "language") {
            selectedValue = selectedValue === baseConfigs.languages.ENGLISH ? "en" : "de";
        }

        let selectedOption = null;
        for (let i = 0; i < selectElement.options.length; i++) {
            let option = selectElement.options[i];
            if (option.value === selectedValue) {
                selectedOption = option;
            }
        }
        selectedOption.selected = true;
    }

    static updateImgSelectElement(heading, key, schemaEntry, selectedValue, formElement) {
        if (heading === "general" && key === "language") {
            selectedValue = selectedValue === baseConfigs.languages.ENGLISH ? "en" : "de";
        }

        let divName = heading + "." + key;
        let enumText = schemaEntry.enumText;
        if (enumText === undefined) {
            throw new Error("No enumText defined");
        }
        let divElement = $(formElement).find("div[name='" + divName + "']")[0];
        // TODO: check for error in number of images
        // if (!(divElement.chil.length === enumText.length)) {
        //    throw new Error("Number of elements does not match number of texts specified in enumText");
        //}

        divElement.value = selectedValue;

        divElement.childNodes.forEach(childNode => childNode.classList.remove("selected"));

        let selectedEnum = schemaEntry.enum.findIndex(enumEntry => enumEntry === selectedValue);
        let selectedChild = divElement.childNodes[selectedEnum];

        if (selectedChild.classList.contains("selected")) {
            selectedChild.classList.remove("selected");
        } else {
            selectedChild.classList.add("selected");
        }
    }
}
