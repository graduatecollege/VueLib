export function takeMsalRedirectHash() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const isMsalResponse = params.has("state") && (params.has("code") || params.has("error"));

    if (!isMsalResponse) {
        return undefined;
    }

    window.history.replaceState(
        window.history.state,
        document.title,
        `${window.location.pathname}${window.location.search}`,
    );
    return hash;
}
