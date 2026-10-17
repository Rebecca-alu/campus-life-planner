
"use strict";

const STORAGE_KEY = "campusPlannerRecords";
const SETTINGS_KEY = "campusPlannerSettings";

const DEFAULT_SETTINGS = {
    durationCap: 600,
    readingSpeed: 30
};

let records = loadRecords();
let settings = loadSettings();

const form = document.getElementById("recordForm");
const titleInput = document.getElementById("title");
const dateInput = document.getElementById("dueDate");
const durationInput = document.getElementById("duration");
const tagInput = document.getElementById("tag");
const editIdInput = document.getElementById("editId");

const recordList = document.getElementById("recordList");
const searchInput = document.getElementById("search");
const caseInput = document.getElementById("caseSensitive");
const sortInput = document.getElementById("sortBy");

const formMessage = document.getElementById("formMessage");
const searchMessage = document.getElementById("searchMessage");
const settingsMessage = document.getElementById("settingsMessage");

const patterns = {
    title: /^\S(?:.*\S)?$/,
    repeatedSpaces: /\s{2,}/,
    number: /^[1-9]\d*$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWords: /\b(\w+)\s+\1\b/i,
    time: /\b\d{2}:\d{2}\b/,
    tagSearch: /^@tag:(.+)$/i
};

function loadRecords() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return [];

        const data = JSON.parse(saved);

        if (!Array.isArray(data)) return [];

        return data.filter(isValidRecord);
    } catch (error) {
        console.error("Could not load saved records:", error);
        return [];
    }
}

function loadSettings() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(SETTINGS_KEY) || "{}"
        );

        return {
            durationCap: Number.isInteger(saved.durationCap) &&
                saved.durationCap >= 1
                ? saved.durationCap
                : DEFAULT_SETTINGS.durationCap,

            readingSpeed: Number.isInteger(saved.readingSpeed) &&
                saved.readingSpeed >= 1
                ? saved.readingSpeed
                : DEFAULT_SETTINGS.readingSpeed
        };
    } catch (error) {
        console.error("Could not load settings:", error);
        return { ...DEFAULT_SETTINGS };
    }
}

function saveRecords() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return true;
    } catch (error) {
        console.error("Could not save records:", error);
        settingsMessage.textContent =
            "Saving failed. Export your data and check browser storage.";
        return false;
    }
}

function saveSettingsToStorage() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error("Could not save settings:", error);
        settingsMessage.textContent = "Settings could not be saved.";
        return false;
    }
}

function isValidDate(value) {
    if (typeof value !== "string" ||
        !patterns.date.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const actualDate = new Date(Date.UTC(year, month - 1, day));

    return actualDate.getUTCFullYear() === year &&
        actualDate.getUTCMonth() === month - 1 &&
        actualDate.getUTCDate() === day;
}

function isValidRecord(record) {
    return record !== null &&
        typeof record === "object" &&
        typeof record.id === "string" &&
        /^rec_\d{4,}$/.test(record.id) &&
        typeof record.title === "string" &&
        record.title.length <= 100 &&
        patterns.title.test(record.title) &&
        !patterns.repeatedSpaces.test(record.title) &&
        !patterns.duplicateWords.test(record.title) &&
        isValidDate(record.dueDate) &&
        Number.isInteger(record.duration) &&
        record.duration >= 1 &&
        record.duration <= 100000 &&
        typeof record.tag === "string" &&
        record.tag.length <= 40 &&
        patterns.tag.test(record.tag) &&
        typeof record.createdAt === "string" &&
        !Number.isNaN(Date.parse(record.createdAt)) &&
        typeof record.updatedAt === "string" &&
        !Number.isNaN(Date.parse(record.updatedAt));
}

function validateForm() {
    const title = titleInput.value;
    const dueDate = dateInput.value;
    const durationText = durationInput.value;
    const tag = tagInput.value;

    if (!patterns.title.test(title)) {
        return "Title cannot start or end with spaces.";
    }

    if (patterns.repeatedSpaces.test(title)) {
        return "Use only one space between words.";
    }

    if (patterns.duplicateWords.test(title)) {
        return "Your title contains a repeated word.";
    }

    if (!isValidDate(dueDate)) {
        return "Enter a real date in YYYY-MM-DD format.";
    }

    if (!patterns.number.test(durationText)) {
        return "Duration must be a positive whole number.";
    }

    const duration = Number(durationText);

    if (duration > 100000) {
        return "Duration cannot exceed 100000 minutes.";
    }

    if (tag.length > 40 || !patterns.tag.test(tag)) {
        return "Tag may contain letters, spaces and hyphens.";
    }

    return "";
}

function createId() {
    let number = 1;

    while (records.some(record =>
        record.id === `rec_${String(number).padStart(4, "0")}`
    )) {
        number++;
    }

    return `rec_${String(number).padStart(4, "0")}`;
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const error = validateForm();

    if (error) {
        formMessage.textContent = error;
        return;
    }

    const now = new Date().toISOString();
    const existing = records.find(
        record => record.id === editIdInput.value
    );

    const record = {
        id: existing ? existing.id : createId(),
        title: titleInput.value,
        dueDate: dateInput.value,
        duration: Number(durationInput.value),
        tag: tagInput.value,
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now
    };

    if (existing) {
        records = records.map(item =>
            item.id === existing.id ? record : item
        );
    } else {
        records.push(record);
    }

    if (!saveRecords()) return;

    formMessage.textContent = existing
        ? "Task updated successfully."
        : "Task added successfully.";

    form.reset();
    editIdInput.value = "";
    document.getElementById("saveButton").textContent = "Add Task";
    document.getElementById("cancelEdit").hidden = true;

    renderApp();
});

function editRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    editIdInput.value = record.id;
    titleInput.value = record.title;
    dateInput.value = record.dueDate;
    durationInput.value = record.duration;
    tagInput.value = record.tag;

    document.getElementById("saveButton").textContent = "Update Task";
    document.getElementById("cancelEdit").hidden = false;
    formMessage.textContent = "Editing " + record.title;

    document.getElementById("task-form").scrollIntoView();
    titleInput.focus();
}

document.getElementById("cancelEdit").addEventListener(
    "click", function () {
        form.reset();
        editIdInput.value = "";
        document.getElementById("saveButton").textContent = "Add Task";
        this.hidden = true;
        formMessage.textContent = "Editing cancelled.";
    }
);

function deleteRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;

    if (!confirm(`Delete "${record.title}"? This cannot be undone.`)) {
        return;
    }

    records = records.filter(item => item.id !== id);

    if (editIdInput.value === id) {
        form.reset();
        editIdInput.value = "";
        document.getElementById("saveButton").textContent = "Add Task";
        document.getElementById("cancelEdit").hidden = true;
    }

    if (!saveRecords()) return;

    formMessage.textContent = "Task deleted.";
    renderApp();
}

function compileRegex(input, caseSensitive = false) {
    if (!input) return null;

    try {
        const flags = caseSensitive ? "g" : "gi";
        return new RegExp(input, flags);
    } catch (error) {
        return null;
    }
}

function getSearchInfo() {
    const query = searchInput.value.trim();

    if (!query) {
        return { regex: null, tag: null, error: false };
    }

    const tagMatch = query.match(patterns.tagSearch);

    if (tagMatch) {
        return {
            regex: null,
            tag: tagMatch[1].trim(),
            error: !tagMatch[1].trim()
        };
    }

    const regex = compileRegex(query, caseInput.checked);

    return {
        regex,
        tag: null,
        error: !regex
    };
}

function recordMatches(record, info) {
    if (info.tag !== null) {
        return record.tag.toLowerCase() === info.tag.toLowerCase();
    }

    if (!info.regex) return true;

    const text = `${record.title} ${record.tag} ${record.dueDate}`;
    const regex = new RegExp(
        info.regex.source,
        info.regex.flags.replace("g", "")
    );

    return regex.test(text);
}

function addHighlightedText(element, text, regex) {
    if (!regex) {
        element.textContent = text;
        return;
    }

    const safeRegex = new RegExp(
        regex.source,
        regex.flags.replace("g", "")
    );

    const matches = [];
    let match;

    const globalRegex = new RegExp(
        safeRegex.source,
        safeRegex.flags + "g"
    );

    while ((match = globalRegex.exec(text)) !== null) {
        matches.push({
            index: match.index,
            value: match[0]
        });

        if (matches.length >= 200) break;

        if (match[0] === "") globalRegex.lastIndex++;
    }

    let position = 0;

    matches.forEach(item => {
        element.appendChild(
            document.createTextNode(text.slice(position, item.index))
        );

        const mark = document.createElement("mark");
        mark.textContent = item.value;
        element.appendChild(mark);

        position = item.index + item.value.length;
    });

    element.appendChild(document.createTextNode(text.slice(position)));
}

function getSortedRecords(items) {
    const sorted = [...items];
    const choice = sortInput.value;

    sorted.sort((a, b) => {
        switch (choice) {
            case "date-asc":
                return a.dueDate.localeCompare(b.dueDate);
            case "date-desc":
                return b.dueDate.localeCompare(a.dueDate);
            case "title-asc":
                return a.title.localeCompare(b.title);
            case "title-desc":
                return b.title.localeCompare(a.title);
            case "duration-asc":
                return a.duration - b.duration;
            case "duration-desc":
                return b.duration - a.duration;
            default:
                return 0;
        }
    });

    return sorted;
}

function renderRecords() {
    recordList.replaceChildren();

    const info = getSearchInfo();

    if (info.error) {
        searchMessage.textContent =
            "Invalid regex or empty tag search. Check your pattern.";
    } else {
        searchMessage.textContent = "";
    }

    const filtered = info.error
        ? []
        : getSortedRecords(records.filter(
            record => recordMatches(record, info)
        ));

    filtered.forEach(record => {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const durationCell = document.createElement("td");
        const tagCell = document.createElement("td");
        const actionsCell = document.createElement("td");

        addHighlightedText(titleCell, record.title, info.regex);
        addHighlightedText(dateCell, record.dueDate, info.regex);

        durationCell.textContent = `${record.duration} min`;
        addHighlightedText(tagCell, record.tag, info.regex);

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", `Edit ${record.title}`);
        editButton.addEventListener("click", () => editRecord(record.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${record.title}`);
        deleteButton.addEventListener("click", () => deleteRecord(record.id));

        actionsCell.append(editButton, deleteButton);
        row.append(titleCell, dateCell, durationCell, tagCell, actionsCell);
        recordList.appendChild(row);
    });

    document.getElementById("emptyMessage").hidden = filtered.length > 0;
    document.getElementById("emptyMessage").textContent =
        records.length === 0
            ? "No tasks yet. Add your first task above."
            : "No tasks match your search.";
}

function renderStats() {
    document.getElementById("totalTasks").textContent = records.length;

    const totalDuration = records.reduce(
        (sum, record) => sum + record.duration, 0
    );

    document.getElementById("totalDuration").textContent =
        `${totalDuration} minutes`;

    const tagCounts = {};

    records.forEach(record => {
        const key = record.tag.toLowerCase();
        tagCounts[key] = (tagCounts[key] || 0) + 1;
    });

    const topTag = Object.keys(tagCounts).sort(
        (a, b) => tagCounts[b] - tagCounts[a] || a.localeCompare(b)
    )[0];

    document.getElementById("topTag").textContent = topTag
        ? `${topTag} (${tagCounts[topTag]})`
        : "None";

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    const dailyTotals = [];

    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);

        const dayKey = [
            day.getFullYear(),
            String(day.getMonth() + 1).padStart(2, "0"),
            String(day.getDate()).padStart(2, "0")
        ].join("-");

        const minutes = records
            .filter(record => {
                const created = new Date(record.createdAt);
                return !Number.isNaN(created.getTime()) &&
                    created.getFullYear() === day.getFullYear() &&
                    created.getMonth() === day.getMonth() &&
                    created.getDate() === day.getDate();
            })
            .reduce((sum, record) => sum + record.duration, 0);

        dailyTotals.push({
            label: day.toLocaleDateString("en", { weekday: "short" }),
            minutes,
            dayKey
        });
    }

    const weeklyTotal = dailyTotals.reduce(
        (sum, day) => sum + day.minutes, 0
    );

    document.getElementById("weeklyTotal").textContent =
        `${weeklyTotal} minutes`;

    renderChart(dailyTotals);
    renderTarget(totalDuration);
}

function renderChart(days) {
    const chart = document.getElementById("weeklyChart");
    chart.replaceChildren();

    const max = Math.max(1, ...days.map(day => day.minutes));

    days.forEach(day => {
        const column = document.createElement("div");
        column.className = "chart-day";

        const value = document.createElement("p");
        value.textContent = day.minutes;

        const bar = document.createElement("div");
        bar.className = "chart-bar";

        const fill = document.createElement("span");
        fill.style.height = `${(day.minutes / max) * 100}%`;
        fill.style.display = "block";

        bar.appendChild(fill);

        const label = document.createElement("span");
        label.textContent = day.label;

        column.append(value, bar, label);
        chart.appendChild(column);
    });
}

function renderTarget(totalDuration) {
    const remaining = settings.durationCap - totalDuration;
    const polite = document.getElementById("targetMessage");
    const assertive = document.getElementById("overTargetMessage");

    if (remaining >= 0) {
        polite.textContent = `${remaining} minutes remaining before your target.`;
        assertive.textContent = "";
    } else {
        polite.textContent = "Your duration target has been exceeded.";
        assertive.textContent =
            `You are ${Math.abs(remaining)} minutes over your target.`;
    }
}

function updateConversion() {
    const speed = settings.readingSpeed;
    document.getElementById("conversionResult").textContent =
        `60 minutes = 1 hour. At ${speed} pages per hour, ` +
        `30 minutes equals approximately ${speed / 2} pages of reading.`;
}

document.getElementById("saveSettings").addEventListener(
    "click", function () {
        const cap = Number(document.getElementById("durationCap").value);
        const speed = Number(document.getElementById("readingSpeed").value);

        if (!Number.isInteger(cap) || cap < 1 || cap > 1000000 ||
            !Number.isInteger(speed) || speed < 1 || speed > 1000) {
            settingsMessage.textContent =
                "Enter a valid positive whole-number target and reading speed.";
            return;
        }

        settings = { durationCap: cap, readingSpeed: speed };

        if (!saveSettingsToStorage()) return;

        settingsMessage.textContent = "Settings saved.";
        renderStats();
        updateConversion();
    }
);

document.getElementById("exportButton").addEventListener(
    "click", function () {
        const fileData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            records
        };

        const blob = new Blob(
            [JSON.stringify(fileData, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "campus-life-planner.json";
        link.click();

        URL.revokeObjectURL(url);
        settingsMessage.textContent = "JSON export created.";
    }
);

document.getElementById("importFile").addEventListener(
    "change", async function () {
        const file = this.files[0];
        if (!file) return;

        try {
            if (file.size > 2 * 1024 * 1024) {
                throw new Error("File is too large. Maximum size is 2 MB.");
            }

            const parsed = JSON.parse(await file.text());

            const imported = Array.isArray(parsed)
                ? parsed
                : parsed && parsed.version === 1 && Array.isArray(parsed.records)
                    ? parsed.records
                    : null;

            if (!imported || imported.length > 10000) {
                throw new Error("Expected a valid JSON record array.");
            }

            if (!imported.every(isValidRecord)) {
                throw new Error("One or more records have invalid fields.");
            }

            const ids = imported.map(record => record.id);

            if (new Set(ids).size !== ids.length) {
                throw new Error("Imported records contain duplicate IDs.");
            }

            if (!confirm(
                `Replace your current ${records.length} records ` +
                `with ${imported.length} imported records?`
            )) {
                settingsMessage.textContent = "Import cancelled.";
                return;
            }

            const previousRecords = records;
            records = imported;

            if (!saveRecords()) {
                records = previousRecords;
                throw new Error("Could not save imported records.");
            }

            settingsMessage.textContent = "Import successful.";
            renderApp();
        } catch (error) {
            settingsMessage.textContent = `Import failed: ${error.message}`;
        } finally {
            this.value = "";
        }
    }
);

searchInput.addEventListener("input", renderRecords);
caseInput.addEventListener("change", renderRecords);
sortInput.addEventListener("change", renderRecords);

function renderApp() {
    renderRecords();
    renderStats();
    updateConversion();
}

document.getElementById("durationCap").value = settings.durationCap;
document.getElementById("readingSpeed").value = settings.readingSpeed;

renderApp();
