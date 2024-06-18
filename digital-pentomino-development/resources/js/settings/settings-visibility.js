/**
 * This class tracks the visibility attributes of all elements in the settings.
 * Visibility in this case means whether the settings entry is visible in the settings in pupil mode.
 * If the settings entry visibility is false, it will be hidden, if true, it will be shown.
 *
 * The class saves it a simple javascript object by the heading and subheading as keys.
 *
 * Main functions:
 * - {@link SettingsVisibility#setVisible} set visiblity of settings entry
 * - {@link SettingsVisibility#isVisible} get visibilty of settings entry
 */
class SettingsVisibility {
    constructor() {
        this.visibility = {};
    }

    /**
     * Sets visibilty of settings entry.
     * @param heading
     * @param subheading
     * @param isVisible
     */
    setVisible(heading, subheading, isVisible) {
        if (this.visibility[heading] === undefined) {
            this.visibility[heading] = {};
            this.visibility[heading].subheadings = {};
        }

        if (this.visibility[heading].subheadings[subheading] === undefined) {
            this.visibility[heading].subheadings[subheading] = {};
        }

        this.visibility[heading].subheadings[subheading] = isVisible;

        let atLeastOneVisible = false;
        for (let subheading in this.visibility[heading].subheadings) {
            if (this.visibility[heading].subheadings[subheading] === true) {
                atLeastOneVisible = true;
            }
        }
        this.visibility[heading].isVisible = atLeastOneVisible;
    }

    /**
     * Returns whether settings entry is visible or not.
     * @param heading
     * @param subheading
     * @returns {boolean}
     */
    isVisible(heading, subheading) {
        if (subheading === undefined && this.visibility[heading] === undefined) {
            throw new Error("Unknown settings heading: " + heading);
        }

        if (subheading === undefined) return this.visibility[heading].isVisible === true;

        if (this.visibility[heading].subheadings[subheading] === undefined) {
            throw new Error("Unknown settings entry: " + heading + "." + subheading);
        }

        return this.visibility[heading].isVisible === true && this.visibility[heading].subheadings[subheading] === true;
    }
}
