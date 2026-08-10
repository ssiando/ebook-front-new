package com.mict.ebook.role.domain;

import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

/**
 * "4DX"처럼 enum 상수명으로 쓸 수 없는 값이 있어 Spring의 기본 Enum.valueOf 바인딩을
 * 쓸 수 없다. @RequestParam/@PathVariable 바인딩에 이 컨버터가 쓰인다 (Jackson 요청
 * 바디는 SystemType의 @JsonCreator가 대신 처리).
 */
@Component
public class SystemTypeConverter implements Converter<String, SystemType> {

    @Override
    public SystemType convert(@NonNull String source) {
        return SystemType.from(source);
    }
}
