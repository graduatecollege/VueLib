/**
 * Generates a deterministic color for a user based on their netID.
 * Useful for displaying user avatars with consistent colors.
 * 
 * @param netId - User's network ID
 * @returns Hex color string
 */
export function netIdToColor(netId: string): string {
    const colors = [
        "#FF5F05",
        "#13294B",
        "#1D58A7",
        "#0085B1",
        "#D69200",
        "#006230",
        "#007E8E",
        "#5C0E41",
        "#7D3E13",
        "#2E2E2E",
    ];
    
    if (!netId) return "#494949ff";
    const hash = Array.from(netId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

/**
 * Formats user initials from their netID or username.
 * Returns "SYS" for system users.
 * 
 * @param updater - Username or netID
 * @returns Formatted initials (uppercase)
 */
export function getUpdaterInitials(updater: string): string {
    if (!updater) return "SYS";
    if (updater === "system") return "SYS";
    return updater.charAt(0).toUpperCase();
}
