package com.mict.ebook.common.util;

public final class StringUtils {

    private static final char DEFAULT_MASK_CHAR = '*';
    private static final int EMAIL_VISIBLE_LOCAL_LENGTH = 2;

    private StringUtils() {
        throw new UnsupportedOperationException("유틸리티 클래스는 인스턴스화할 수 없습니다.");
    }

    public static boolean isEmpty(String str) {
        return str == null || str.isEmpty();
    }

    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }

    public static boolean isBlank(String str) {
        return str == null || str.isBlank();
    }

    public static boolean isNotBlank(String str) {
        return !isBlank(str);
    }

    public static String defaultIfBlank(String str, String defaultValue) {
        return isBlank(str) ? defaultValue : str;
    }

    /** {@code maxLength}를 넘는 문자열을 잘라낸다. {@code str}이 null이거나 길이 이내면 그대로 반환한다. */
    public static String truncate(String str, int maxLength) {
        if (str == null || str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength);
    }

    /** 앞 {@code prefixLength}자, 뒤 {@code suffixLength}자만 남기고 나머지를 {@code maskChar}로 가린다. */
    public static String mask(String value, int prefixLength, int suffixLength, char maskChar) {
        if (isEmpty(value)) {
            return value;
        }
        int length = value.length();
        if (prefixLength + suffixLength >= length) {
            return String.valueOf(maskChar).repeat(length);
        }
        String prefix = value.substring(0, prefixLength);
        String suffix = value.substring(length - suffixLength);
        String masked = String.valueOf(maskChar).repeat(length - prefixLength - suffixLength);
        return prefix + masked + suffix;
    }

    /** 이메일 로컬파트(@ 앞부분) 앞 2자만 남기고 나머지를 마스킹한다. 예: hong@example.com → ho**@example.com */
    public static String maskEmail(String email) {
        if (isBlank(email)) {
            return email;
        }
        int atIndex = email.indexOf('@');
        if (atIndex < 0) {
            return mask(email, EMAIL_VISIBLE_LOCAL_LENGTH, 0, DEFAULT_MASK_CHAR);
        }
        String localPart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex);
        return mask(localPart, EMAIL_VISIBLE_LOCAL_LENGTH, 0, DEFAULT_MASK_CHAR) + domainPart;
    }

    /** 전화번호 가운데 자리를 마스킹하며 구분자는 하이픈으로 통일한다. 예: 01012345678 → 010-****-5678 */
    public static String maskPhoneNumber(String phoneNumber) {
        if (isBlank(phoneNumber)) {
            return phoneNumber;
        }
        return phoneNumber.replaceAll("(\\d{2,3})-?(\\d{3,4})-?(\\d{4})$", "$1-****-$3");
    }
}
