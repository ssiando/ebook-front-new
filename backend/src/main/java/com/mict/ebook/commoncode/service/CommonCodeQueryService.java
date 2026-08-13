package com.mict.ebook.commoncode.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.commoncode.domain.CodeGroup;
import com.mict.ebook.commoncode.domain.CommonCodeErrorCode;
import com.mict.ebook.commoncode.dto.CodeGroupResponse;
import com.mict.ebook.commoncode.dto.CodeItemResponse;
import com.mict.ebook.commoncode.dto.CommonCodeSearchRequest;
import com.mict.ebook.commoncode.mapper.CommonCodeRestMapper;
import com.mict.ebook.commoncode.repository.mapper.CommonCodeMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommonCodeQueryService {

    private final CommonCodeMapper commonCodeMapper;
    private final CommonCodeRestMapper commonCodeRestMapper;

    public List<CodeGroupResponse> searchGroups(CommonCodeSearchRequest request) {
        List<CodeGroup> groups = commonCodeMapper.searchGroups(request.keyword(), request.useYn());
        return commonCodeRestMapper.toGroupResponses(groups);
    }

    public List<CodeItemResponse> findItemsByGroupId(Long groupId) {
        findGroup(groupId);
        return commonCodeRestMapper.toItemResponses(commonCodeMapper.findItemsByGroupId(groupId));
    }

    public List<CodeItemResponse> findItemsByGroupCode(String groupCode) {
        return commonCodeRestMapper.toItemResponses(commonCodeMapper.findItemsByGroupCode(groupCode));
    }

    private CodeGroup findGroup(Long id) {
        return commonCodeMapper
                .findGroupById(id)
                .orElseThrow(() -> new BusinessException(CommonCodeErrorCode.GROUP_NOT_FOUND));
    }
}
