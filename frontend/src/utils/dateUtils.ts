/**
 * ISO 문자열 형식의 날짜를 표시용 포맷으로 변환합니다.
 * @param isoString ISO 문자열 형식의 날짜
 * @returns 'YYYY/MM/DD HH:MM' 형식의 날짜 문자열
 */
export function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * 날짜를 YYYY-MM 형식으로 변환합니다.
 * @param date 날짜 객체 또는 ISO 문자열
 * @returns 'YYYY-MM' 형식의 문자열
 */
export function getYearMonth(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}
