# SpinShare - Client3
A modern cross-platform desktop client for SpinShare

## Overview
- [Setup](#setup)
- [Building](#building)

### Setup
#### Installing all dependencies
```sh
cd UserInterface && npm install
```

#### Running a dev server
```sh
cd UserInterface && npm run dev
```

#### Starting the client
```sh
dotnet run
```

### Building
#### Building the UI
```sh
cd UserInterface && npm run build
```

#### Building the application
```sh
dotnet build --configuration Release
```

### Update translations
- Go to the translation sheet on Google Spreadsheets
- Open Export Sheet Data
- Export as JSON, place the JSON file in `/SpinShareClient/UserInterface/src/i18n/`
- Run the `npm run generate-i18n` command to generate the correct translation files