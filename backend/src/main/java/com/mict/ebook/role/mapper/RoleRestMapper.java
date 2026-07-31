package com.mict.ebook.role.mapper;

import com.mict.ebook.role.domain.Role;
import com.mict.ebook.role.dto.RoleResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleRestMapper {

    RoleResponse toResponse(Role role, long memberCount, List<String> programIds);
}
