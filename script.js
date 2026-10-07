/* =========================================================
   MOORE TO MEALY CONVERTER
   Complete script.js
   ========================================================= */


/* =========================
   SAMPLE DATA
   ========================= */

const SAMPLE = {
    states: ["q0", "q1", "q2"],

    symbols: ["0", "1"],

    start: "q0",

    outputs: {
        q0: "0",
        q1: "1",
        q2: "0"
    },

    transitions: {
        q0: {
            "0": "q1",
            "1": "q2"
        },

        q1: {
            "0": "q1",
            "1": "q2"
        },

        q2: {
            "0": "q0",
            "1": "q1"
        }
    }
};


/* =========================
   GET ELEMENTS
   ========================= */

const statesInput =
    document.getElementById("states");

const symbolsInput =
    document.getElementById("symbols");

const startInput =
    document.getElementById("start");

const outputsInput =
    document.getElementById("outputs");

const transitionsInput =
    document.getElementById("transitions");

const generateBtn =
    document.getElementById("generate");

const convertBtn =
    document.getElementById("convertBtn");

const sampleBtn =
    document.getElementById("sample");

const resetBtn =
    document.getElementById("reset");

const errorBox =
    document.getElementById("error");

const mooreTable =
    document.getElementById("mooreTable");

const mooreDiagram =
    document.getElementById("mooreDiagram");

const mealyTable =
    document.getElementById("mealyTable");

const mealyDiagram =
    document.getElementById("mealyDiagram");

const conversionNote =
    document.getElementById("conversionNote");

const summary =
    document.getElementById("summary");


/* =========================
   CURRENT MACHINE
   ========================= */

let currentMachine = null;
let currentMealy = null;


/* =========================
   SHOW ERROR
   ========================= */

function showError(message) {

    if (!errorBox) return;

    errorBox.textContent = message;

    errorBox.style.display = "block";
}


/* =========================
   HIDE ERROR
   ========================= */

function hideError() {

    if (!errorBox) return;

    errorBox.textContent = "";

    errorBox.style.display = "none";
}


/* =========================
   PARSE LIST
   ========================= */

function parseList(value) {

    return value
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");
}


/* =========================
   PARSE OUTPUTS
   ========================= */

function parseOutputs(value) {

    const outputs = {};

    const parts = value
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");

    parts.forEach(part => {

        const pieces = part.split("=");

        if (pieces.length === 2) {

            const state =
                pieces[0].trim();

            const output =
                pieces[1].trim();

            outputs[state] = output;
        }

    });

    return outputs;
}


/* =========================
   PARSE TRANSITIONS
   ========================= */

function parseTransitions(value) {

    const transitions = {};

    const lines = value
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "");

    lines.forEach(line => {

        const parts = line
            .split(",")
            .map(item => item.trim());

        if (parts.length !== 3) {
            return;
        }

        const from = parts[0];
        const input = parts[1];
        const to = parts[2];

        if (!transitions[from]) {
            transitions[from] = {};
        }

        transitions[from][input] = to;

    });

    return transitions;
}


/* =========================
   READ INPUT
   ========================= */

function readMachine() {

    hideError();

    const states =
        parseList(statesInput.value);

    const symbols =
        parseList(symbolsInput.value);

    const start =
        startInput.value.trim();

    const outputs =
        parseOutputs(outputsInput.value);

    const transitions =
        parseTransitions(transitionsInput.value);


    /* Validation */

    if (states.length === 0) {

        showError("Please enter at least one state.");

        return null;
    }


    if (symbols.length === 0) {

        showError("Please enter at least one input symbol.");

        return null;
    }


    if (!start) {

        showError("Please enter the start state.");

        return null;
    }


    if (!states.includes(start)) {

        showError(
            "Start state must be one of the entered states."
        );

        return null;
    }


    for (const state of states) {

        if (outputs[state] === undefined) {

            showError(
                "Please provide an output for state " + state
            );

            return null;
        }

    }


    for (const state of states) {

        if (!transitions[state]) {

            showError(
                "Missing transitions for state " + state
            );

            return null;
        }


        for (const symbol of symbols) {

            if (
                transitions[state][symbol] === undefined
            ) {

                showError(
                    `Missing transition for ${state} on input ${symbol}.`
                );

                return null;
            }


            const destination =
                transitions[state][symbol];

            if (!states.includes(destination)) {

                showError(
                    `Invalid destination state ${destination}.`
                );

                return null;
            }

        }

    }


    return {
        states,
        symbols,
        start,
        outputs,
        transitions
    };
}


/* =========================
   GENERATE MACHINE
   ========================= */

function generate() {

    const machine = readMachine();

    if (!machine) {
        return;
    }

    currentMachine = machine;

    renderMooreTable(machine);

    renderMooreDiagram(machine);

    mealyTable.innerHTML = `
        <p class="placeholder">
            Click "Convert to Mealy" to generate the Mealy table.
        </p>
    `;

    mealyDiagram.innerHTML = `
        <p class="placeholder">
            Click "Convert to Mealy" to generate the Mealy diagram.
        </p>
    `;

    if (conversionNote) {
        conversionNote.style.display = "none";
        conversionNote.innerHTML = "";
    }

    if (summary) {
        summary.innerHTML = `
            <p>
                Moore machine generated successfully.
                Click <strong>Convert to Mealy</strong>
                to perform the conversion.
            </p>
        `;
    }

    const inputSection =
        document.getElementById("input");

    if (inputSection) {
        inputSection.style.display = "block";
    }
}


/* =========================
   MOORE TABLE
   ========================= */

function renderMooreTable(machine) {

    let html = `
        <table>
            <thead>
                <tr>
                    <th>State</th>
    `;

    machine.symbols.forEach(symbol => {

        html += `
            <th>Input ${escapeHTML(symbol)}</th>
        `;

    });

    html += `
                    <th>Output</th>
                </tr>
            </thead>
            <tbody>
    `;


    machine.states.forEach(state => {

        html += `
            <tr>
                <td>
                    <strong>${escapeHTML(state)}</strong>
                </td>
        `;


        machine.symbols.forEach(symbol => {

            const nextState =
                machine.transitions[state][symbol];

            html += `
                <td>
                    ${escapeHTML(nextState)}
                </td>
            `;

        });


        html += `
                <td>
                    <strong>
                        ${escapeHTML(machine.outputs[state])}
                    </strong>
                </td>
            </tr>
        `;

    });


    html += `
            </tbody>
        </table>
    `;

    mooreTable.innerHTML = html;
}


/* =========================
   CONVERT MOORE TO MEALY
   ========================= */

function convertToMealy() {

    if (!currentMachine) {

        showError(
            "Please generate the Moore machine first."
        );

        return;
    }

    hideError();

    const machine = currentMachine;

    const mealy = {
        states: [...machine.states],
        symbols: [...machine.symbols],
        start: machine.start,
        transitions: {}
    };


    machine.states.forEach(state => {

        mealy.transitions[state] = {};

        machine.symbols.forEach(symbol => {

            const nextState =
                machine.transitions[state][symbol];

            const output =
                machine.outputs[nextState];

            mealy.transitions[state][symbol] = {
                state: nextState,
                output: output
            };

        });

    });


    currentMealy = mealy;

    renderMealyTable(mealy);

    renderMealyDiagram(mealy);

    if (conversionNote) {

        conversionNote.style.display = "block";

        conversionNote.innerHTML = `
            <strong>Conversion completed:</strong>
            In a Mealy machine, the output is attached
            to the transition. Therefore, for every Moore
            transition, the output of the destination state
            is used.
        `;
    }


    if (summary) {

        summary.innerHTML = `
            <p>
                <strong>Conversion successful.</strong>
            </p>

            <p>
                States: ${machine.states.length}
                &nbsp; | &nbsp;
                Input Symbols: ${machine.symbols.length}
            </p>

            <p>
                Start State:
                <strong>${escapeHTML(machine.start)}</strong>
            </p>

            <p>
                The Moore machine has been converted into
                an equivalent Mealy machine.
            </p>
        `;
    }
}


/* =========================
   MEALY TABLE
   ========================= */

function renderMealyTable(machine) {

    let html = `
        <table>
            <thead>
                <tr>
                    <th>State</th>
    `;


    machine.symbols.forEach(symbol => {

        html += `
            <th>
                Input ${escapeHTML(symbol)}
            </th>
        `;

    });


    html += `
                </tr>
            </thead>

            <tbody>
    `;


    machine.states.forEach(state => {

        html += `
            <tr>
                <td>
                    <strong>${escapeHTML(state)}</strong>
                </td>
        `;


        machine.symbols.forEach(symbol => {

            const transition =
                machine.transitions[state][symbol];

            html += `
                <td>
                    ${escapeHTML(transition.state)}
                    /
                    ${escapeHTML(transition.output)}
                </td>
            `;

        });


        html += `
            </tr>
        `;

    });


    html += `
            </tbody>
        </table>
    `;

    mealyTable.innerHTML = html;
}


/* =========================
   MOORE DIAGRAM
   ========================= */

function renderMooreDiagram(machine) {

    const width = 850;

    const rowHeight = 120;

    const height =
        Math.max(
            350,
            machine.states.length * rowHeight
        );


    const centerX = width / 2;


    let svg = `
        <svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            xmlns="http://www.w3.org/2000/svg"
        >

        <defs>

            <marker
                id="arrowMoore"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
            >
                <path
                    d="M0,0 L0,6 L9,3 z"
                    fill="#2563eb"
                />
            </marker>

        </defs>
    `;


    const positions = {};


    machine.states.forEach(
        (state, index) => {

            positions[state] = {
                x: centerX,
                y: 70 + index * rowHeight
            };

        }
    );


    /* Transitions */

    machine.states.forEach(state => {

        const from =
            positions[state];


        machine.symbols.forEach(symbol => {

            const destination =
                machine.transitions[state][symbol];

            const to =
                positions[destination];


            if (!to) {
                return;
            }


            if (state === destination) {

                svg += `
                    <path
                        d="
                            M ${from.x - 25}
                              ${from.y - 25}

                            C ${from.x - 85}
                              ${from.y - 90},

                              ${from.x + 85}
                              ${from.y - 90},

                              ${from.x + 25}
                              ${from.y - 25}
                        "
                        fill="none"
                        stroke="#2563eb"
                        stroke-width="2"
                        marker-end="url(#arrowMoore)"
                    />

                    <text
                        x="${from.x}"
                        y="${from.y - 72}"
                        text-anchor="middle"
                        fill="#374151"
                        font-size="14"
                    >
                        ${escapeHTML(symbol)}
                    </text>
                `;

            } else {

                const midX =
                    (from.x + to.x) / 2;

                const midY =
                    (from.y + to.y) / 2;


                svg += `
                    <line
                        x1="${from.x}"
                        y1="${from.y + 32}"
                        x2="${to.x}"
                        y2="${to.y - 32}"
                        stroke="#2563eb"
                        stroke-width="2"
                        marker-end="url(#arrowMoore)"
                    />

                    <text
                        x="${midX + 10}"
                        y="${midY}"
                        fill="#374151"
                        font-size="14"
                    >
                        ${escapeHTML(symbol)}
                    </text>
                `;

            }

        });

    });


    /* States */

    machine.states.forEach(state => {

        const position =
            positions[state];

        const isStart =
            state === machine.start;


        if (isStart) {

            svg += `
                <line
                    x1="${position.x - 90}"
                    y1="${position.y}"
                    x2="${position.x - 35}"
                    y2="${position.y}"
                    stroke="#2563eb"
                    stroke-width="2"
                    marker-end="url(#arrowMoore)"
                />
            `;

        }


        svg += `
            <circle
                cx="${position.x}"
                cy="${position.y}"
                r="35"
                fill="#ffffff"
                stroke="#2563eb"
                stroke-width="3"
            />

            <text
                x="${position.x}"
                y="${position.y - 3}"
                text-anchor="middle"
                fill="#111827"
                font-size="15"
                font-weight="bold"
            >
                ${escapeHTML(state)}
            </text>

            <text
                x="${position.x}"
                y="${position.y + 17}"
                text-anchor="middle"
                fill="#2563eb"
                font-size="13"
            >
                / ${escapeHTML(machine.outputs[state])}
            </text>
        `;

    });


    svg += `
        </svg>
    `;

    mooreDiagram.innerHTML = svg;
}


/* =========================
   MEALY DIAGRAM
   ========================= */

function renderMealyDiagram(machine) {

    const width = 850;

    const rowHeight = 120;

    const height =
        Math.max(
            350,
            machine.states.length * rowHeight
        );


    const centerX = width / 2;


    let svg = `
        <svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            xmlns="http://www.w3.org/2000/svg"
        >

        <defs>

            <marker
                id="arrowMealy"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
            >
                <path
                    d="M0,0 L0,6 L9,3 z"
                    fill="#16a34a"
                />
            </marker>

        </defs>
    `;


    const positions = {};


    machine.states.forEach(
        (state, index) => {

            positions[state] = {
                x: centerX,
                y: 70 + index * rowHeight
            };

        }
    );


    /* Transitions */

    machine.states.forEach(state => {

        const from =
            positions[state];


        machine.symbols.forEach(symbol => {

            const transition =
                machine.transitions[state][symbol];

            const destination =
                transition.state;

            const to =
                positions[destination];


            if (!to) {
                return;
            }


            const label =
                `${symbol} / ${transition.output}`;


            if (state === destination) {

                svg += `
                    <path
                        d="
                            M ${from.x - 25}
                              ${from.y - 25}

                            C ${from.x - 85}
                              ${from.y - 90},

                              ${from.x + 85}
                              ${from.y - 90},

                              ${from.x + 25}
                              ${from.y - 25}
                        "
                        fill="none"
                        stroke="#16a34a"
                        stroke-width="2"
                        marker-end="url(#arrowMealy)"
                    />

                    <text
                        x="${from.x}"
                        y="${from.y - 72}"
                        text-anchor="middle"
                        fill="#166534"
                        font-size="14"
                        font-weight="600"
                    >
                        ${escapeHTML(label)}
                    </text>
                `;

            } else {

                const midX =
                    (from.x + to.x) / 2;

                const midY =
                    (from.y + to.y) / 2;


                svg += `
                    <line
                        x1="${from.x}"
                        y1="${from.y + 35}"
                        x2="${to.x}"
                        y2="${to.y - 35}"
                        stroke="#16a34a"
                        stroke-width="2"
                        marker-end="url(#arrowMealy)"
                    />

                    <text
                        x="${midX + 12}"
                        y="${midY}"
                        fill="#166534"
                        font-size="14"
                        font-weight="600"
                    >
                        ${escapeHTML(label)}
                    </text>
                `;

            }

        });

    });


    /* States */

    machine.states.forEach(state => {

        const position =
            positions[state];


        if (state === machine.start) {

            svg += `
                <line
                    x1="${position.x - 90}"
                    y1="${position.y}"
                    x2="${position.x - 35}"
                    y2="${position.y}"
                    stroke="#16a34a"
                    stroke-width="2"
                    marker-end="url(#arrowMealy)"
                />
            `;

        }


        svg += `
            <circle
                cx="${position.x}"
                cy="${position.y}"
                r="35"
                fill="#ffffff"
                stroke="#16a34a"
                stroke-width="3"
            />

            <text
                x="${position.x}"
                y="${position.y + 5}"
                text-anchor="middle"
                fill="#111827"
                font-size="15"
                font-weight="bold"
            >
                ${escapeHTML(state)}
            </text>
        `;

    });


    svg += `
        </svg>
    `;


    mealyDiagram.innerHTML = svg;
}


/* =========================
   ESCAPE HTML
   ========================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   LOAD SAMPLE
   ========================= */

function loadSample() {

    statesInput.value =
        SAMPLE.states.join(",");

    symbolsInput.value =
        SAMPLE.symbols.join(",");

    startInput.value =
        SAMPLE.start;


    outputsInput.value =
        Object.entries(SAMPLE.outputs)
            .map(
                ([state, output]) =>
                    `${state}=${output}`
            )
            .join(",");


    const lines = [];

    SAMPLE.states.forEach(state => {

        SAMPLE.symbols.forEach(symbol => {

            lines.push(
                `${state},${symbol},${SAMPLE.transitions[state][symbol]}`
            );

        });

    });


    transitionsInput.value =
        lines.join("\n");


    generate();
}


/* =========================
   RESET
   ========================= */

function resetMachine() {

    statesInput.value = "";

    symbolsInput.value = "";

    startInput.value = "";

    outputsInput.value = "";

    transitionsInput.value = "";

    currentMachine = null;

    currentMealy = null;

    hideError();


    mooreTable.innerHTML = `
        <p class="placeholder">
            Generate the Moore machine to view the table.
        </p>
    `;


    mooreDiagram.innerHTML = `
        <p class="placeholder">
            Generate the Moore machine to view the diagram.
        </p>
    `;


    mealyTable.innerHTML = `
        <p class="placeholder">
            Convert the Moore machine to view the Mealy table.
        </p>
    `;


    mealyDiagram.innerHTML = `
        <p class="placeholder">
            Convert the Moore machine to view the Mealy diagram.
        </p>
    `;


    if (conversionNote) {

        conversionNote.style.display =
            "none";

        conversionNote.innerHTML = "";

    }


    if (summary) {

        summary.innerHTML = `
            <p>
                Enter a Moore machine and click
                <strong>Generate Moore Machine</strong>.
            </p>
        `;

    }

}


/* =========================
   BUTTON EVENTS
   ========================= */

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        generate
    );

}


if (convertBtn) {

    convertBtn.addEventListener(
        "click",
        convertToMealy
    );

}


if (sampleBtn) {

    sampleBtn.addEventListener(
        "click",
        loadSample
    );

}


if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        resetMachine
    );

}


/* =========================
   PWA SERVICE WORKER
   ========================= */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register("sw.js")
                .then(function () {

                    console.log(
                        "Service Worker registered successfully."
                    );

                })
                .catch(function (error) {

                    console.log(
                        "Service Worker registration failed:",
                        error
                    );

                });

        }
    );

}


/* =========================
   PWA INSTALL BUTTON
   ========================= */

let deferredPrompt = null;

const installBtn =
    document.getElementById("installBtn");


window.addEventListener(
    "beforeinstallprompt",
    function (event) {

        event.preventDefault();

        deferredPrompt = event;


        if (installBtn) {

            installBtn.style.display =
                "inline-block";

        }

    }
);


if (installBtn) {

    installBtn.addEventListener(
        "click",
        async function () {

            if (!deferredPrompt) {

                alert(
                    "Install option is not available yet. Please open the website in Chrome or Edge."
                );

                return;
            }


            deferredPrompt.prompt();


            const result =
                await deferredPrompt.userChoice;


            if (
                result.outcome === "accepted"
            ) {

                installBtn.style.display =
                    "none";

            }


            deferredPrompt = null;

        }
    );

}


window.addEventListener(
    "appinstalled",
    function () {

        if (installBtn) {

            installBtn.style.display =
                "none";

        }

        console.log(
            "Moore to Mealy Converter installed successfully."
        );

    }
);


/* =========================
   INITIAL SAMPLE
   ========================= */

window.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSample();

    }
);
