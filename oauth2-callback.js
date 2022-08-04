const basePath = process.env.VUE_ROUTER_BASE;

const url = new URL(basePath, window.origin);
// url.hash = `/authorization/oauth2/callback#${window.location.hash}`;
url.hash = `/authorization/oauth2/callback${window.location.search?.replace(/^\?/, '#') || ''}`;
window.location.href = url.toString()
