package com.mict.ebook.program.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** id가 null이거나 0 이하이면 신규 행(그리드에서 임시 음수 id를 부여한 새 행)으로 취급해 INSERT한다. */
public record ProgramItemRequest(
        Long id,
        @NotNull Long workspaceId,
        Long parentProgramId,
        @NotBlank String code,
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "API|PAGE") String type,
        String httpMethod,
        @NotBlank String url,
        int sortOrder,
        boolean displayYn,
        boolean useYn,
        Long i18nKeyId,
        String description) {

    public boolean isNew() {
        return id == null || id <= 0;
    }
}
