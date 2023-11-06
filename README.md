# react-frontend

This repository holds the code for the frontend part of the Naviair UTM project.  
The first aim of the project is to implement a drone platform that, through integrations with other services, visualizes the law regarding drone operations in specific zones in Denmark.

Was previous live at https://droneluftrum.dk

## Running the project

1. Clone
2. `npm install`
3. Run one of the available scripts in [package.json](package.json) - usually `npm start`.

Ensure you are on the correct branch at all times.

The version need backend services for working, does will be published to GitHub later on.
To get the current version running, you need to implement you own backend-services.

## Integrations

- MongoDB backend for compact data and on-the-fly updates.
- Calls to Azure Function integrations for external services (MongoDB, Openweathermap, Mapbox, ...)
- Sentry.io for error tracking
- i18next for translations, mainly `da-DK` to `en-US` but the reverse can be found.

## Specific to this repository

The frontend is designed using AntDesign and custom, generic components.

The main language used in application views are Danish and should be coded so. Translations are added later.

### Noteworthy elements

- React
- TypeScript
- Sass
- Babel
- Webpack
- AntDesign
- i18next
- Recoil

Integrations with

- Auth0
- Elastic
- Mapbox
- Sentry
- MongoDB
- Firebase

For more specifics, see [package.json](package.json).

## Environments

The .env files for each environment can be found in the [env](env) folder.  
The `dev` environment is tied to the dev-mongoDB, dev-Sentry project, and so on.

## Noteworthy files

VSCode settings can be found in [.vscode](.vscode). 
react-frontend uses private packages maintained by Naviair. See [.npmrc](.npmrc).  
ESLint setup can be found in [eslintrc.json](.eslintrc.json).  
Code formatting is done using the VSCode `Prettier` extension. See [.prettierrc.json](.prettierrc.json).  
App entrypoint is [src\index.tsx](src\index.tsx) and [src\Views\App\App.tsx](src\Views\App\App.tsx).  
App-wide styles and variables can be found in [src\Styles\Styles.scss](src\Styles\Styles.scss).

### Folder structure

Make sure to adhere to the folder structure already in place when implementing new components.

Looking at the files in [src\Components](src\Components), you'll notice a pattern of subfolders containing usually very few files and then the stylesheet (`styles.scss`) for the given component. This structure enforces the design principle of _low coupling, high cohesion_ while promoting generic, re-usable components.

Divide files into multiple where the overall implementation can benefit from it.

### Frameworks and libraries: Security and licenses

As a developer you should ensure that the frameworks and libraries that you add are up to standards.

1. Using NPM audit (vulnerabilities): `npm run audit`.
2. Using license-summary: `npm run license-summary`.
3. Using license-check: `npm run license-check`.

All licenses should be _permissive_.

### Implementing with translations in mind

The current translations can be found in the configuration from MongoDB.  
When writing new Danish content, be aware that it has to be translated and then added to the MongoDB configuration.

When writing new generic components, translate their text props, so that the translate hook only have to be called in one place.

Longer texts should be implemented as documents or pages (see the database and the FAQ/About implementations).

### Using i18n for translations

react-i18next has a hook for using with translations. When using the hook, it is important to use it at the outermost level and pass the result down as props.  
This means using it directly on strings when first written, rather than on the prop itself inside the component.

```js
import { useTranslation } from "react-i18next";
...
    const [t] = useTranslation('translations');
    <Antd.Panel header={t('Funktionelle')} >
...
```

1. Import
2. Use the `useTranslation` hook for the `t` function. The parameter `translations` is the only namespace we currently use.
3. Translate the `header` prop input sentence with the `t` function.

The useTranslation hook normally looks like this:

```js
const [t, i18n] = useTranslation();
```

but we do not need the i18n-instance for translations, so it is left out.  
We initiate i18n in its own file ([src/translations/i18n.ts](src\Translation\i18n.ts)) and modify it in App.tsx (and only there).

The hook can only be used inside React Functional Components.  
In the event that you need to translate elsewhere, other methods are supplied which can be found on react-18n's website.
One suggestion that we have previously used is to pass the `t` function as a parameter to the function and use it inside the function.
