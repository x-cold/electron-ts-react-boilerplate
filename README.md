# electron-ts-react-boilerplate

A brief starter for developing electron applications.

### Dependencies

- Electron v15
- React v17
- TypeScript v4

### Usage

- Clone the boilerplate to your folder

```bash
git clone git@github.com:x-cold/electron-ts-react-boilerplate.git YOURFOLDERNAME
cd YOURFOLDERNAME
```

- Install dependencies

```bash
npm install
```

- Development

```bash
# After running this command, it will automatically start renderer and electron process as well as restart when any files in 'src/**' changed.
npm run dev

# If you want to debug main process, you can start via debug mode by type F5 or run the following command
# npm run debug
```

### Features

- [x] Intergrates the latest version of React, Electron, TypeScripts
- [x] Basic directory and engineering structure
- [x] It's very easy to start developing your application
- [ ] Build Mac / Windows / Linux packages
- [ ] Software signification

### NPM scripts

 - `npm run dev`: Start to develop your application in
 - `npm run debug`: Debug the electron-main process
 - `npm run build`: Build renderer and electron-main 
 - `npm run pack`: Rebuild and release application packages
