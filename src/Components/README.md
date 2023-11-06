# Components
Contains every component in the project

### Component categories
Components will generally be either of one category: **reusable**, or **not reusable**.  
If a component is *resuable* it is found inside ```./Common```. This could fx. be the ```Dropdown``` component, which is used to implement different kinds of dropdown menus, *and* most likely will be used to create more in the future. These components are implemented in a generic/dynamic manner, so they are easily reusable. We do this to avoid redundant code and duplicates, and also to simplify the implementation process of new components.  
If a component is *not reusable* it is *not* found inside ```./Common```. This could fx. be the ```Header``` component which is implemented solely for the purpose of having a header in this application, without current intentions of reusing it anywhere else. Generally, every component here could be modified to be *reusable*  

### New components  
As a general rule, try to always make reusable components but -  
If the component is intended to be reusable, put it in the ```Common``` folder,  
If the component is dependant on a lot of other code, it will most likely not be reusable, and should be put outside ```./Common```

If you are implementing a new feature, which could be implemented using a component which is *not* reusable, then you should modify the component to be reusable, to avoid duplicates.

### Component structure
Generally we try to follow the following structure, when creating new components:
```
📦 Component
 ┣ 📜 Component.tsx
 ┣ 📜 index.tsx
 ┗ 📜 styles.scss
```
The directory ```Component```, which is the directory containing the source files for the component.   
The component-file ```Component.tsx```, which is the file that will define the functionality of the component.  
An index file ```index.tsx```, which should export the component. Every component should have an index file for export, allowing us to import the components easier. They will allow us to import like below (depending on working directory), because it will be linked through the exports of the index files:  
```ts
import { Component } from '.';
```
instead of
```ts
import { Component } from './Common/Component/Component.tsx';
```
It will also allow us to import multiple components in the same import statement like below:  
```ts
import { ComponentOne, ComponentTwo } from '.';
```
instead of 
```ts
import { ComponentOne } from './Common/Component/ComponentOne.tsx';
import { ComponentTwo } from './Common/Component/ComponentTwo.tsx';
```
A ```styles.scss```, which should be used for styling. We try to keep a ```styles.scss``` in every component, to avoid having one large stylesheet. This way styles are also more manageable, as you will always find the style classes for the particular component in its corresponding directory. If there is no need for styles for the particular component, ```styles.scss``` should not be created.  