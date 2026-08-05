package com.mict.ebook.commoncode.service;

import com.mict.ebook.commoncode.domain.CodeGroup;
import com.mict.ebook.commoncode.domain.CodeItem;
import com.mict.ebook.commoncode.domain.CommonCodeErrorCode;
import com.mict.ebook.commoncode.dto.CodeGroupResponse;
import com.mict.ebook.commoncode.dto.CodeItemResponse;
import com.mict.ebook.commoncode.dto.CreateCodeGroupRequest;
import com.mict.ebook.commoncode.dto.CreateCodeItemRequest;
import com.mict.ebook.commoncode.dto.UpdateCodeGroupRequest;
import com.mict.ebook.commoncode.dto.UpdateCodeItemRequest;
import com.mict.ebook.commoncode.mapper.CommonCodeRestMapper;
import com.mict.ebook.commoncode.repository.mapper.CommonCodeMapper;
import com.mict.ebook.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class CommonCodeCommandService {

    private final CommonCodeMapper commonCodeMapper;
    private final CommonCodeRestMapper commonCodeRestMapper;

    public CodeGroupResponse createGroup(CreateCodeGroupRequest request) {
        if (commonCodeMapper.existsGroupByCode(request.groupCode())) {
            throw new BusinessException(CommonCodeErrorCode.GROUP_CODE_DUPLICATE);
        }

        CodeGroup group = CodeGroup.createNew(
                request.groupCode(), request.groupName(), request.description(), request.useYn(), request.i18nKey());
        commonCodeMapper.insertGroup(group);
        return commonCodeRestMapper.toResponse(group);
    }

    public CodeGroupResponse updateGroup(Long id, UpdateCodeGroupRequest request) {
        CodeGroup group = findGroup(id);
        if (commonCodeMapper.existsGroupByCodeExcludingId(request.groupCode(), id)) {
            throw new BusinessException(CommonCodeErrorCode.GROUP_CODE_DUPLICATE);
        }

        group.update(
                request.groupCode(), request.groupName(), request.description(), request.useYn(), request.i18nKey());
        commonCodeMapper.updateGroup(group);
        return commonCodeRestMapper.toResponse(group);
    }

    public void deleteGroup(Long id) {
        findGroup(id);
        // common_code_item.group_id는 ON DELETE CASCADE라 소속 항목도 함께 삭제된다.
        commonCodeMapper.deleteGroupById(id);
    }

    public CodeItemResponse createItem(Long groupId, CreateCodeItemRequest request) {
        findGroup(groupId);
        if (commonCodeMapper.existsItemByGroupIdAndCode(groupId, request.code())) {
            throw new BusinessException(CommonCodeErrorCode.ITEM_CODE_DUPLICATE);
        }

        CodeItem item = CodeItem.createNew(
                groupId,
                request.code(),
                request.codeName(),
                request.sortOrder(),
                request.useYn(),
                request.description(),
                request.metadata(),
                request.i18nKey());
        commonCodeMapper.insertItem(item);
        return commonCodeRestMapper.toResponse(item);
    }

    public CodeItemResponse updateItem(Long groupId, Long id, UpdateCodeItemRequest request) {
        findGroup(groupId);
        CodeItem item = findItem(id);
        if (commonCodeMapper.existsItemByGroupIdAndCodeExcludingId(groupId, request.code(), id)) {
            throw new BusinessException(CommonCodeErrorCode.ITEM_CODE_DUPLICATE);
        }

        item.update(
                request.code(),
                request.codeName(),
                request.sortOrder(),
                request.useYn(),
                request.description(),
                request.metadata(),
                request.i18nKey());
        commonCodeMapper.updateItem(item);
        return commonCodeRestMapper.toResponse(item);
    }

    public void deleteItem(Long groupId, Long id) {
        findGroup(groupId);
        findItem(id);
        commonCodeMapper.deleteItemById(id);
    }

    private CodeGroup findGroup(Long id) {
        return commonCodeMapper
                .findGroupById(id)
                .orElseThrow(() -> new BusinessException(CommonCodeErrorCode.GROUP_NOT_FOUND));
    }

    private CodeItem findItem(Long id) {
        return commonCodeMapper
                .findItemById(id)
                .orElseThrow(() -> new BusinessException(CommonCodeErrorCode.ITEM_NOT_FOUND));
    }
}
