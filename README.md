<img width="60px" src="https://i.imgur.com/dlHRY3S.png" />

# Hive.one Extension

> Browser extension to show user influence on Crypto Twitter.

<a href="https://chrome.google.com/webstore/detail/dibbclmoocoenjjdjgdmgdbedcjeafjl/"><img src="https://img.shields.io/chrome-web-store/v/dibbclmoocoenjjdjgdmgdbedcjeafjl.svg"></a>

<div style="text-align: center;">
  <img width="514px" src="https://i.imgur.com/kvlf8Vh.png" />
</div>

It is hard to tell, which Twitter accounts are truly influential. This extension displays influence scores directly on Twitter profiles.

These are the same scores as available on [Hive.one](https://hive.one). You can choose to display scores for the Crypto Twitter or specific sub-clusters, such as BTC or ETH.


## Install

- [Chrome](https://chrome.google.com/webstore/detail/dibbclmoocoenjjdjgdmgdbedcjeafjl/)

- [Firefox](https://addons.mozilla.org/en-GB/firefox/addon/hive-one/)

## Build from source

*We strongly recommend installing using Chrome Store, but here are instructions if you'd like to build and install it manually.*

```
npm install
```

## Run in developer environment

1. Run:

```
npm run dev
```

2. Go to `chrome://extensions`
3. Click "Load unpacked"
4. Choose `build` directory created by Webpack inside project directory


## Production build

Run:
```
npm run build
```