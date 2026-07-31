package com.mict.ebook.menu.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.menu.domain.Menu;
import com.mict.ebook.menu.domain.MenuErrorCode;
import com.mict.ebook.menu.dto.CreateMenuRequest;
import com.mict.ebook.menu.dto.MenuResponse;
import com.mict.ebook.menu.dto.UpdateMenuRequest;
import com.mict.ebook.menu.mapper.MenuRestMapper;
import com.mict.ebook.menu.repository.mapper.MenuMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class MenuCommandService {

    private final MenuMapper menuMapper;
    private final MenuRestMapper menuRestMapper;

    public MenuResponse create(CreateMenuRequest request) {
        if (menuMapper.existsById(request.id())) {
            throw new BusinessException(MenuErrorCode.MENU_ID_DUPLICATE);
        }
        if (request.parentId() != null && !menuMapper.existsById(request.parentId())) {
            throw new BusinessException(MenuErrorCode.MENU_PARENT_NOT_FOUND);
        }

        Menu menu =
                Menu.createNew(request.id(), request.parentId(), request.label(), request.path(), request.sortOrder());
        menuMapper.insert(menu);
        return menuRestMapper.toResponse(menu);
    }

    public MenuResponse update(String id, UpdateMenuRequest request) {
        Menu menu = findMenu(id);
        if (request.parentId() != null && !menuMapper.existsById(request.parentId())) {
            throw new BusinessException(MenuErrorCode.MENU_PARENT_NOT_FOUND);
        }

        menu.update(request.parentId(), request.label(), request.path(), request.sortOrder());
        menuMapper.update(menu);
        return menuRestMapper.toResponse(menu);
    }

    public void delete(String id) {
        findMenu(id);
        if (menuMapper.countChildrenByParentId(id) > 0) {
            throw new BusinessException(MenuErrorCode.MENU_HAS_CHILDREN);
        }
        menuMapper.deleteById(id);
    }

    private Menu findMenu(String id) {
        return menuMapper.findById(id).orElseThrow(() -> new BusinessException(MenuErrorCode.MENU_NOT_FOUND));
    }
}
