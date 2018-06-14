# git-tracker
`NO SETUP REQUIRED` - Tracks .git status of all repos in a project to provide up-to-date status of all repos.

## Status
Fetches the status of each git repo in cwd every 60 seconds for changes by default.

```
~/Project (development)
$ node watch
-> ./ : development : 8 commits behind!
-> git-proj1 : feat/live-update : OK
-> git-proj2 : development : OK
-> git-proj3 : development : OK
```

## Usage
Place the `watch.js` file into the parent project folder and run `node watch`

```
Project
├── .git/
├── watch.js
│
├── git-proj1/
│   └── .git/   
│
├── git-proj2/
│   └── .git/
│
└── git-proj3/
    └── .git/
```
