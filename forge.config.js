module.exports = {
  packagerConfig: {
    executableName: "strongswan-sdk",
    icon: './logos/strong-swan-logo.svg',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      executableName: "strongswan-sdk",
      config: {
        options: {
          icon: './logos/strong-swan-logo.svg',
          name: 'my-electron-app',
          productName: 'my-electron-app'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
