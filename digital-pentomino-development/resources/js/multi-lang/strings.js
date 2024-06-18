const strings = {
    general: {
        no: ["No", "Nein"],
        yes: ["Yes", "Ja"],
        ok: ["ok", "ok"],
        cancel: ["cancel", "Abbrechen"],
        or: ["or", "oder"],
        submit: ["Apply", "Übernehmen"],
        qrCodeScanned: ["Successfully scanned", "Erfolgreich gescannt"],
        wrongQrCode: ["Scanned in wrong QR-code.", "Falschen QR-Code eingescannt."],
        showCameraUnavailable: ["Camera is not available on your device !", "Die Kamera ist auf Ihrem Gerät nicht verfügbar!"]
    },
    reset: ["Do You Want to clear the board?", "Willst du das Brett wirklich leeren?"],
    showSolved: {
        congrats: ["Congratulations!", "Glückwunsch!"],
        play: ["Play Again?", "Nochmal spielen?"],
    },
    speechbubbleTexts: {
        Solved: ["Ya hoo !! You solved it !", "Juhu!! Du hast es gelöst!"],
        pleaseContinue: ["Please continue with the game", "Bitte fahre mit dem Spiel fort"],
        pleaseStop: ["Wait for the hint", "Auf den Hinweis warten"],
        helloThere: ["Hello are you there ?", "Hallo, bist du noch da?"],
        welcomeBack:["Welcome back!", "Willkommen zurück!"],
        iHaveAHint:["I have a hint", "Ich habe einen Tipp"],
        clickHintbtn:["Click on the hint button", "Klicken Sie auf die Schaltfläche Hinweis"],
        removePentomino:["Remove", "Entferne"],
        move:["Move", "Verschieben"],
        MoveToPosition:["to position","zu positionieren"],
        atPosition:["at position","an Ort und Stelle"],
        place:["Place", "Ort"],
        rotate:["Rotate", "Drehen Sie"],
        clockwise:["clockwise","nach rechts"],
        antiClockwise:["anti-clockwise", "nach links"],
        mirror:["Mirror","Spiegel"],
        vertical:["vertical","vertikal"],
        horizontal:["horizontal","horizontal"],
        showHint:["Show hint","Hinweis"],
        ignore:["Ignore","Ignorieren Sie"]
    },
    numberOfPossibleSolutions: ["Number of solutions", "Anzahl Lösungen"],
    License: ["Licenses", "Lizenzen"],
    replay:{
        doReply: ["Replay", "Wiedergabe"],
        startStateText: ["Start State", "Startzustand"],
        endStateText: ["End State","Endzustand"],
        deleteSnapshot: ["Delete", "Löschen"],
        loadSnapshot: ["Load", "Laden"],
        gameNotStartedYet: ["Game has not started yet", "Es wurde noch keine Aktion durchgeführt"]
    },
    settings: {
        header: ["Game settings", "Spieleinstellungen"],
        advanced: {
            show: ["Show advanced settings", "Öffne erweiterte Einstellungen"],
            hide: ["Hide advanced settings", "Schließe erweiterte Einstellungen"]
        },
        visibilitySettings: ["Displayed Settings in Pupil Mode", "Angezeigte Einstellungen im Schüler-Modus"],
        buttons: {
            apply: ["Apply", "Bestätigen"],
            cancel: ["Cancel", "Abbrechen"]
        },
        general: {
            title: ["General", "Allgemein"],
            language: {
                title: ["Language", "Sprache"],
                enumTitles: [["English", "German"], ["Englisch", "Deutsch"]]
            },
            enableAudio: {
                title: ["Sound effects", "Soundeffekte"]
            },
            enableBgMusic: {
                title: ["Background Music", "Hintergrundmusik"]
            },
            enableBird: {
                title: ["Tuca as helper", "Tuca als Helfer"]
            }
        },
        license: {
            enumTitles: [["Name", "Name"], ["Author", "Autor"],["Link", "Link"], ["License", "Lizenz"]],
             solvedScreenMagician: ["Solved Screen Magician image", "Gelöstes Screen Magician-Bild"],
             solvedScreenBoy: ["Solved screen boy image", "Gelöster Bildschirm Junge Bild"],
             solvedScreenGift: ["Solved Screen Gift image", "Gelöst Bildschirm Geschenkbild"],
             backgroundMusic: ["Background Music", "Hintergrundmusik"],
             functionsMusic: ["Functions Music","Funktionen Musik"],
             html2canvas:["html2canvas","html2canvas"],
             loadash:["loadash","loadash"],
            qrScannerIcon: ["QR Scanner Icon", "QR Scanner Icon"],
            ButtonForFLip: ["Flip Icons", "Flip-Icons"],
            ButtonForRotate: ["Rotate Icons", "Drehen-Icons"],
            ButtonForSettings: ["Settings Icon", "Einstellungen-Icon"],
            Boardpicker: ["Boardpicker Icon", "Bordauswahl-Icon"],
            Prefill: ["Prefill Icon", "Prefill-Icon"],
            Close: ["Close Icon", "Schließen-Icon"],
            Back: ["Back Icon", "Zurück-Icon"],
            SpeechBubbleCode: ["SpeechBubble Code", "Sprechblasen-Code"],
        },
        speech:{
            title: ["Speech", "Rede"],
            enableSpeech:{
                title: ["Enable speech", "Sprache freigeben"],
                description: ["Enabling this option makes the application speak,Standard German slang is used for german language translation and"+ "<br />" +" english slang for english language translation.",
                "Wenn Sie diese Option aktivieren, spricht die Anwendung.Die deutsche Standardsprache wird für die deutsche Übersetzung verwendet, die englische für die englische Übersetzung."]
            }
        },
        autohinting:{
            title: ["Auto hinting", "Automatische Hilfestellung"],
            enableAutoHinting:{
                title: ["Automated hinting", "Automatisierte Hilfestellung"],
                description: ["Enables auto-hinting", "Aktiviert automatisierte Hilfestellung"]
            },
            initiateActionsIfUserNotActive:{
                title: ["Remind if user is not active", "Hinweis, wenn der Benutzer nicht aktiv ist"],
                description: ["Initiates actions only if user is not active on the application", "Löst nur Aktionen aus, wenn der Benutzer nicht in der Anwendung aktiv ist"]
            },
            showOrHideButtonsForTextualHints:{
                title: ["Hints can be denied", "Hinweise können abgelehnt werden"],
                description: ["Shows buttons in case the user wants autohinting for textual hints as optional else textual hints will occur automatically.",
                "Zeigt Schaltflächen an wenn der Benutzer automatische für Texthinweise als Option wünscht andernfalls werden Texthinweise automatisch angezeigt."]
            },

            autoHintVariants:{
                timebased: {
                  title: ["Gives auto-hint based on time with time set below", "Automatisierte Hilfestellung geben nach"],
                  description: [
                      "Auto-hinting based on the in-active player time, in this case if the player is near to the solution hints are not provided. "+ "<br />" +" In case the user is far from the solution, hints are provided.",
                      "Auto-Hinting basierend auf der Zeit, in der der Spieler inaktiv ist. In diesem Fall werden keine Hinweise gegeben, wenn der "+ "<br />" +" Spieler sich in der Nähe der Lösung befindet. Befindet sich der Benutzer weit von der Lösung entfernt, werden Hinweise gegeben."]
                },
                wrongMoves: {
                  title: ["Gives auto-hint based on number of wrong actions set below.", "Gibt einen automatischen Hinweis basierend auf der Anzahl "+ "<br />" +" falscher Aktionen, die unten eingestellt sind."],
                  description: [
                      "Auto-hinting based on the number of wrong moves, here the user can only make the number of wrong moves configured below here in the "+ "<br />" +" settings, for every number of wrong moves, hint is provided.",
                      "Auto-Hinweis basierend auf der Anzahl falscher Züge, hier kann der Benutzer nur die Anzahl falscher Züge machen, die hier unten in den "+ "<br />" +" Einstellungen konfiguriert ist, für jede Anzahl falscher Züge wird ein Hinweis gegeben.Gibt einen automatischen Hinweis basierend auf der Anzahl falscher Aktionen, die unten eingestellt sind"]
                }
            },
            enableTimePeriodBasedAutoHintInAnyCase:{
              title: [["Enable time period based autohinting in any case"],["Hilfestellung deaktivieren wenn nur noch X Steine platziert werden müssen"]],
              description: ["Enabling activates time period based hinting in any case. But disabling this option makes the time period based auto hinting inactive  "+ "<br />" +"in case the user is towards the solution.",
              "Wenn Sie diese Option aktivieren, wird der zeitraumbasierte Hinweis in jedem Fall aktiviert. Durch die Deaktivierung dieser Option wird der "+ "<br />" +"zeitraumbasierte automatische Hinweis jedoch inaktiv, wenn der Benutzer auf die Lösung zusteuert."]
            },

            numberOfWrongMoves: {
                title: ["Number of wrong actions", "Anzahl der falschen Aktionen"],
                  description: ["After how any number of wrong moves should the hint occur automatically",
                  "Nach einer beliebigen Anzahl von falschen Zügen sollte der Hinweis automatisch erfolgen"]
            },

            timeForNoAction: {
                title: ["Time to wait for no action", "Zeit zum Warten, nicht zum Handeln"],
                  enumTitles: [["Short", "Medium", "Long"], ["Kurz", "Mittel", "Lang"]],
                  description: [
                  "Provides Time delay for no action :"  +
                      "<ul>" +
                          "<li><b>Short:</b> Short time : 30 seconds</li>" +
                          "<li><b>Medium:</b> Medium time : 1 minute 30 seconds</li>" +
                            "<li><b>Long:</b> Long time : 2 minute 30 seconds</li>" +
                      "</ul>",
                      "Bietet Zeitverzögerung für keine Aktion:" +
                      "<ul>" +
                          "<li><b>Kurz:</b> Kurze Zeit : 30 Sekunden</li>" +
                          "<li><b>Mittel:</b> Mittlere Zeit : 1 Minute 30 Sekunden</li>" +
                            "<li><b>Lang:</b> Lange Zeit: 2 Minuten 30 Sekunden</li>" +
                      "</ul>"]
            },

            typeOfHints:{
                title: ["Type of hints for auto-hinting", "Art der Hinweise für das Auto-Hinting"],
                enumTitles: [["Visual", "Visual and textual"], ["Visuell", "Visuell und textuell"]],
                description: [
                "Provides automatic hints :"  +
                    "<ul>" +
                        "<li><b>Visual:</b> Gives only visual hints.</li>" +
                        "<li><b>Visual and textual:</b> Gives visual and textual hints.</li>" +
                    "</ul>",
                    "Liefert automatische Hinweise :" +
                        "<ul>" +
                        "<li><b>Visuell:</b> Gibt nur visuelle Hinweise.</li>" +
                        "<li><b>Visuell und textuell:</b> Gibt textuelle und visuelle Hinweise.</li>" +
                        "</ul>"]
            }
        },
        hinting: {
            title: ["Hinting (Experimental)", "Hilfestellung (Experimentell)"],
            enableHinting: {
                title: ["Hint button", "Hilfestellungs-Button"],
                description: ["This option enables hint button, if disabled hint button will be invisible.","Diese Option aktiviert die Hinweis-Schaltfläche, "+ "<br />" +" wenn sie deaktiviert ist, ist die Hinweis-Schaltfläche unsichtbar."]
            },
            hintingLevels: {
                title: ["Assistance", "Hilfestellung"],
                enumTitles: [["High", "Medium", "Low","Custom"], ["Viel", "Mittel", "Wenig", "Individuell"]],
                description: [
                "Levels of assistance :"  +
                    "<ul>" +
                        "<li><b>High:</b> Makes the game solvable more easily with high help functionality for high assistance.Player will get easier hints, exact "+ "<br />" +" hints, board prefilling is possible and both the pentomino and the destination will be indicated.</li>" +
                        "<li><b>Medium:</b> Medium level of help functionality for assistance.Medium hinting strategy enabled.</li>" +
                        "<li><b>Low:</b> Low level of assistance.Difficult hints will be configured.Prefilling of the board is disabled.</li>" +
                        "<li><b>Custom:</b> Nothing gets changed, but you can change as per your convenience.</li>" +
                    "</ul>",
                    "Stufen der Unterstützung :" +
                    "<ul>" +
                      "<li><b>Viel:</b> Macht das Spiel leichter lösbar mit hoher Hilfefunktionalität für hohe Unterstützung.Der Spieler erhält leichtere Hinweise, genaue "+ "<br />" +" Hinweise, das Spielbrett kann vorausgefüllt werden und sowohl das Pentomino als auch das Ziel werden angezeigt.</li>" +
                      "<li><b>Mittel:</b> Mittleres Niveau der Hilfefunktionalität für Unterstützung.Mittlere Hinweisstrategie aktiviert.</li>" +
                      "<li><b>Wenig:</b> Niedriges Niveau der Hilfestellung. Schwere Hinweise werden konfiguriert. Das Vorfüllen der Tafel ist deaktiviert.</li>" +
                      "<li><b>Individuell:</b>Es wird nichts geändert, aber Sie können nach Belieben Änderungen vornehmen.</li>" +
                  "</ul>"]
            },
            showNumberOfPossibleSolutions: {
                title: ["Show number of possible solutions", "Zeige Anzahl der möglichen Lösungen an"],
                description: ["Shows the number of solutions that contain the current pentominoes on the board.",
                    "Zeigt die Anzahl der Lösungen an, die mit den Pentominoes wie sie zu diesem Zeitpunkt auf dem Spielbrett liegen, möglich sind."]
            },
            typeOfHints:{
                title: ["Type of hints", "Art der Hinweise"],
                enumTitles: [["Visual","Visual and textual"], ["Visuell","Visuell und textlich"]],
                description: [
                "Provides hints :"  +
                    "<ul>" +
                        "<li><b>Visual:</b> Gives only visual hints.</li>" +
                        "<li><b>Visual and textual:</b> Gives both visual and textual hints</li>" +
                    "</ul>",
                    "Liefert Hinweise :" +
                        "<ul>" +
                        "<li><b>Visuell:</b> Gibt nur visuelle Hinweise.</li>" +
                        "<li><b>Visuell und textlich:</b> Gibt sowohl visuelle als auch textliche Hinweise</li>" +
                        "</ul>"]
            },
            hintingStrategy: {
                title: ["Hint Type", "Art der Hinweise"],
                enumTitles: [["Concrete", "Partial", "Area"], ["Konkret", "Partiell", "Bereich"]],
                description: [
                    "Specifies what hints are given to the user:" +
                        "<ul>" +
                            "<li><b>Concrete Hints:</b> A hint suggests a specific action for a specific pentomino.</li>" +
                            "<li><b>Partial Hints:</b> An action is indicated by displaying cells of the pentomino in the desired state.</li>" +
                            "<li><b>Area Hints:</b> An action is indicated by displaying an area, where the pentomino should be placed.</li>" +
                        "</ul>",
                    "Spezifiziert, von welcher Art die Hinweise sind:" +
                        "<ul>" +
                            "<li><b>Konkrete Hinweise:</b> Der Hinweis empfiehlt eine Zielposition für ein Pentomino.</li>" +
                            "<li><b>Partielle Hinweise:</b> Das Zielfeld wird nur angedeutet, indem Teile der Zielposition des Pentominos angezeigt werden.</li>" +
                            "<li><b>Bereich-Hinweise:</b> Es wird ein Bereich vorgeschlagen, in dem ein Pentomino zu platzieren ist.</li>" +
                        "</ul>"]
            },
            partialHintingStrategy: {
                title: ["Partial Hinting Strategy", "Strategie für partielle Hinweise"],
                enumTitles: [["Random", "Most Occupied Cells"], ["Zufällig", "Feld mit den wenigsten freien Nachbarn"]],
                description: ["",
                    ""]
            },
            maxPartialHintingCells: {
                title: ["Max Partial Hinting Cells", "Maximale Anzahl Zielpositionen bei partiellen Hinweisen"],
                description: ["If Partial hinting is enabled, the number of cells is randomly determined between 1 and the specified value.",
                    "Die Anzahl der Zielpositionen, die bei partiellen Hinweisen angezeigt werden, ist zufällig zwischen 1 und er eingestellten Zahl."]
            },
            skillTeaching: {
                title: ["Enable Skill-Teaching?", "Erklärung für Hilfestellungen"],
                description: ["If skill-teaching is enabled, some hints are providing additional information to teach certain skills.",
                    "Wenn Fähigkeits-lehrende Hinweise eingeschaltet sind, werden manche bei manchen Hinweisen versucht, zusätzliche Fähigkeiten zu vermitteln."]
            },
            exactHints: {
                title: ["Seperate Hints into individual actions", "Hilfestellungen in Einzelaktionen zerlegen"],
                description: ["If enabled, Rotate, Flip and Move-actions that should be performed on one pentomino are three separate hints. Otherwise these actions are combined into one hint.",
                    "Aktiviert: Drehen, Spiegeln und Bewege-Aktionen, die auf ein Pentomino angewandt werden müssen sind drei separate Hinweise. Deaktiviert: Aktionen werden in einem Hinweis zusammengefasst."]
            },
            hintingVariants: {
                title: ["Hinting variants", "Varianten der Hilfestellungen"],
                enumTitles: [
                    ["Show pentominoes", "Show destination", "Show both"],
                    ["Pentomino anzeigen", "Ziel anzeigen", "Beides anzeigen"]
                ],
                description: [
                    "Variants of hinting:" +
                        "<ul>" +
                            "<li><b>Show pentominoes:</b> Indicates only pentominos.</li>" +
                            "<li><b>Show destination:</b> Indicates only detsination.</li>" +
                            "<li><b>Show both:</b> Indicates pentominos and destination.</li>" +
                        "</ul>",
                    "Varianten der Andeutung:" +
                        "<ul>" +
                            "<li><b>Pentomino anzeigen:</b> Zeigt nur Pentominos an.</li>" +
                            "<li><b>Zielort anzeigen:</b> Zeigt nur das Ziel an.</li>" +
                            "<li><b>Beides anzeigen:</b> Zeigt Pentominos und Zielort an.</li>" +
                        "</ul>"]

            }
        },

        prefilling: {
            title: ["Prefilled boards", "Vorbelegte Bretter"],
            fixPieces: {
                title: ["Fix pentominos", "Pentominos fixieren"],
                description: ["Pieces cannot be moved after being automatically placed", "Teile können nicht verschoben werden, nachdem sie automatisch platziert wurden"],
            },
            enablePrefilling: {
                title: ["Prefilling button", "Automatisches Füllen Button"],
                description: ["Prefilling fills the board randomly with pentominoes.",
                    "Automatisches Füllen platziert zufällig Pentominoes auf das Spielfeld."]
            },
            prefillingStrategy: {
                title: ["Strategy for prefilling", "Strategie für automatisches Füllen"],
                enumTitles: [["Distance", "Pieces"], ["Distanz: mindestens X Felder zwischen Pentominos", "Nachbar: X Pentominos aneinander"]],
                description: ["",""]
            },
            distanceValue: {
                title: ["Distance value", "Distanz-Wert"],
                enumTitles: {
                    distance: [["2"], ["3"], ["4"], ["5"]],
                    pieces: [["3"], ["2"], ["1"], ["0"]]
                }
            }
        },
        theming: {
            title: ["Appearance", "Aussehen"],
            theme: {
                title: ["Theme", "Design"],
                enumTitles: [["Default", "DayTuca", "NightTuca"], ["Standard", "TucaHell", "TucaDunkel"]],
                description: ["General theme of the application.", "Grundlegendes Design der Applikation"]
            }
        },
        splitPartition: {
            title: ["Board Partitioning", "Brettdrittelung"],
            splitStrategy: {
                title: ["Split Board into Partion By", "Wie sollen die Partitionen angezeigt werden?"],
                enumTitles: [["Color","Left-to-Right"], ["Gleichzeitig anzeigen", "Eine nach der anderen anzeigen"]],
            }
        },
        boardCustomization: {
            title: ["Board Customization", "Spielbrett Anpassung"],
            initialPiecePos: {
                title: ["Predefine start game", "Wähle das Start-Spielbrett"],
                description: ["When starting the app, the saved board will be selected and pieces loaded at their saved position.", "Wenn die App gestartet wird, wird das gespeicherte Spielbrett geladen und die Spielsteine starten an ihrer gespeicherten Position."]
            },
            includePiecePos: {
                title: ["Include pentomino pieces", "Pentomino-Spielsteine mit einbeziehen"],
                description: ["", ""]
            },
            shareThisBoard: {
                title: ["Share this board?", "Teile dieses Brett?"]
            }
        },
        errors: {
            lowerThanMin: ["This shouldn't be smaller than", "Dieser Eintrag darf nicht kleiner sein als"],
            higherThanMax: ["This shouldn't be greater than", "Dieser Eintrag darf nicht größer sein als"],
            numberBadInput: ["Please enter a number", "Bitte geben Sie eine Zahl ein"]
        }
    },
    qrCode: {
        scanOrShare: ["Scan or Share?", "Scannen oder Teilen?"],
        share: {
            shareQrCode: ["Share QR-code", "Teile QR-code"],
            copyUrl: ["Copy", "Kopieren"],
            urlToTest: ["Link", "Link"],
            teachersMode: ["Share with teachers (Settings available)", "Teile mit anderen Lehrern (Einstellungen verfügbar)"],
            pupilMode: ["Share with class (Settings restricted)", "Teile mit Schülern (Einstellungen eingeschränkt)"],
            print: ["Print", "Drucken"],
            downloadImage: ["Download as image", "Als Bild herunterladen"],
            useThisQrCodeFirstPart: ["You can use this QR-code to transfer your current settings on your pupil's devices. For that, print it and let it being scanned by your pupils with the",
                "Sie können mit diesem QR-Code Ihre momentanen Einstellungen zu den Geräten Ihrer Schüler transferieren. Drucken Sie ihn dafür aus und lassen Sie ihn von Ihren Schülern mit dem "],
            useThisQrCodeSecondPart: ["-Button in the TUCA-App.", "-Button in der TUCA-App scannen."]
        },
        scan: {
            scanQrCode: ["QR-code", "QR-code"]
        }
    }
};


/* Pupil mode: Nur noch grundlegende Einstellungen können verändert werden. Teacher mode: Alle Einstellungen können verändert werden. */
