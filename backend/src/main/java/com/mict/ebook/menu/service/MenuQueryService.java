package com.mict.ebook.menu.service;

import com.mict.ebook.common.exception.BusinessException;
import com.mict.ebook.common.response.PageResponse;
import com.mict.ebook.menu.domain.Menu;
import com.mict.ebook.menu.domain.MenuErrorCode;
import com.mict.ebook.menu.dto.MenuResponse;
import com.mict.ebook.menu.dto.MenuSearchRequest;
import com.mict.ebook.menu.dto.MenuTreeResponse;
import com.mict.ebook.menu.mapper.MenuRestMapper;
import com.mict.ebook.menu.repository.mapper.MenuMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuQueryService {

    // 최상위 메뉴 그룹 id별 접근 허용 역할명. 프론트엔드 src/utils/menuPermission.ts의
    // MENU_GROUP_ROLE_NAMES와 동일한 기준이며, 맵에 없는 그룹(대시보드/홈 등)은 제한이 없다.
    private static final Map<String, Set<String>> RESTRICTED_ROOT_MENU_ROLES = Map.of(
            "admin", Set.of("ADMIN", "SUPER_ADMIN", "WORKSPACE_ADMIN"),
            "system", Set.of("SUPER_ADMIN", "WORKSPACE_ADMIN"));

    private final MenuMapper menuMapper;
    private final MenuRestMapper menuRestMapper;

    public PageResponse<MenuResponse> search(MenuSearchRequest request) {
        List<Menu> menus =
                menuMapper.search(request.parentId(), request.keyword(), request.offset(), request.pageSize());
        long totalCount = menuMapper.countBySearch(request.parentId(), request.keyword());

        List<MenuResponse> items =
                menus.stream().map(menuRestMapper::toResponse).toList();
        return PageResponse.of(items, totalCount, request.page(), request.pageSize());
    }

    public MenuResponse getById(String id) {
        return menuRestMapper.toResponse(findMenu(id));
    }

    /** 로그인한 관리자의 역할명 목록을 기준으로 접근 가능한 최상위 메뉴만 남긴 트리를 반환한다. */
    public List<MenuTreeResponse> getMenuTree(List<String> roleNames) {
        List<Menu> menus = menuMapper.findAllOrderBySortOrder();

        Map<String, List<Menu>> childrenByParentId = menus.stream()
                .filter(menu -> menu.getParentId() != null)
                .collect(Collectors.groupingBy(Menu::getParentId, LinkedHashMap::new, Collectors.toList()));

        return menus.stream()
                .filter(menu -> menu.getParentId() == null)
                .filter(menu -> isRootMenuAccessible(menu.getId(), roleNames))
                .map(menu -> toTreeResponse(menu, childrenByParentId))
                .toList();
    }

    private boolean isRootMenuAccessible(String menuId, List<String> roleNames) {
        Set<String> requiredRoles = RESTRICTED_ROOT_MENU_ROLES.get(menuId);
        if (requiredRoles == null) {
            return true;
        }
        return roleNames.stream().anyMatch(requiredRoles::contains);
    }

    private MenuTreeResponse toTreeResponse(Menu menu, Map<String, List<Menu>> childrenByParentId) {
        List<MenuTreeResponse> children = childrenByParentId.getOrDefault(menu.getId(), List.of()).stream()
                .map(child -> toTreeResponse(child, childrenByParentId))
                .toList();
        return new MenuTreeResponse(menu.getId(), menu.getLabel(), menu.getPath(), children);
    }

    private Menu findMenu(String id) {
        return menuMapper.findById(id).orElseThrow(() -> new BusinessException(MenuErrorCode.MENU_NOT_FOUND));
    }
}
