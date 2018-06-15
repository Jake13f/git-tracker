const { execSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const SECOND = 1000;
const MINUTE = 60 * SECOND;

const REFRESH_RATE = 1 * MINUTE;

// Console window colors.  Prepend to console.log message to use.
const COLORS = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
}

var gitFolders = [];

/**
 * Gets the subdirectories for a given folder.
 * @param {string} p the directory to get sub directories for.
 * @return {array<string>} the array of subdirectories for the given folder.
 */
const getDirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory() && f != 'node_modules');


/**
 * Recursively traverses a given directory until all subdirectories have been reached and locates
 * all folders with .git repos inside of them.
 * @param {string} directory the directory to check inside 
 */
function dive (directory)
{
    var cwd = getDirs(directory);

    if (cwd.indexOf('.git') > -1)
    {
        gitFolders.push(directory);
    }

    cwd.forEach(dir => {
        if (dir !== '.git')
            dive(join(directory, dir));
    });
}

/**
 * Handles checking the git statuses
 * @param {boolean} fetch if true fetches remote for changes, false uses local status
 * @return {Array<object>} The statuses of each git repo in the project
 */
function handleStatuses (fetch)
{
    var statuses = [];
    gitFolders.forEach(folder => {
        if (fetch) {
            process.stdout.write(`Looking for changes...${folder}                 \r`);
            execSync(`cd ${folder} && git fetch`);
        }

        var status = execSync(`cd ${folder} && git status`).toString();
        var upToDate = status.indexOf('behind') === -1;
        var attr = status.match(/On branch (.*)(\n.*behind '(.*)' by (\d+) commit)?/);
    
        statuses.push({
            repo: folder,
            branch: attr[1],
            origin: attr[3],
            commitsBehind: attr[4],
            upToDate: upToDate
        });
    });

    return statuses;
}

/**
 * Handles rendering the git statuses to the screen
 */
function render (fetch = true)
{
    var statuses = handleStatuses(fetch);
    console.clear();
    console.log(`----------------------------------`);
    console.log(`-          Git Tracking          -`);
    console.log(`----------------------------------`);
    statuses.forEach(status => {
        var msg = `-> ${status.repo} : ${COLORS.FgYellow}${status.branch}${COLORS.Reset} : ${status.upToDate ? `${COLORS.FgGreen}OK` : `${COLORS.FgRed}${status.commitsBehind} commits behind!`}${COLORS.Reset}`;
        console.log(msg);
    });
    console.log(`----------------------------------`);
}


dive('./');
render(false); // Quickly show current status
render(true); // Start fetching for updates
setInterval(render, REFRESH_RATE); // Start regular interval
