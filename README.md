<img width="60px" src="https://i.imgur.com/KK0Bs5b.jpg" />

# Hive.one Extension

> Browser extension to show user influence on Crypto Twitter.

<a href="https://chrome.google.com/webstore/detail/dibbclmoocoenjjdjgdmgdbedcjeafjl/"><img src="https://img.shields.io/chrome-web-store/v/dibbclmoocoenjjdjgdmgdbedcjeafjl.svg"></a>

<div style="text-align: center;">
  <img width="514px" src="https://i.imgur.com/PJhRcMk.png" />
  <img width="284px" src="https://i.imgur.com/a61X1U6.png" />
</div>

It is hard to tell, which Twitter accounts are truly influential. This extension displays influence scores directly on Twitter profiles.

These are the same scores as available on [Hive.one](https://hive.one). You can choose to display scores for the Crypto Twitter or specific sub-clusters, such as BTC or ETH.


## Install

- [Chrome extension](https://chrome.google.com/webstore/detail/dibbclmoocoenjjdjgdmgdbedcjeafjl/)

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