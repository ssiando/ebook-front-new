package com.mict.ebook.role.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;

public enum SystemType {
    VFX("VFX"),
    GENX("GENX"),
    FDX("4DX"),
    ASSET("ASSET"),
    DESK("DESK");

    private final String value;

    SystemType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static SystemType from(String value) {
        return Arrays.stream(values())
                .filter(type -> type.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown system type: " + value));
    }
}
