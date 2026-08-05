package com.mict.ebook.commoncode.mapper;

import com.mict.ebook.commoncode.domain.CodeGroup;
import com.mict.ebook.commoncode.domain.CodeItem;
import com.mict.ebook.commoncode.dto.CodeGroupResponse;
import com.mict.ebook.commoncode.dto.CodeItemResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommonCodeRestMapper {

    CodeGroupResponse toResponse(CodeGroup group);

    List<CodeGroupResponse> toGroupResponses(List<CodeGroup> groups);

    CodeItemResponse toResponse(CodeItem item);

    List<CodeItemResponse> toItemResponses(List<CodeItem> items);
}
