package com.mict.ebook.admin.mapper;

import com.mict.ebook.admin.domain.Admin;
import com.mict.ebook.admin.dto.AdminResponse;
import java.util.Arrays;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AdminRestMapper {

    @Mapping(target = "groups", source = "admin.groupNames")
    AdminResponse toResponse(Admin admin, List<Long> roleIds);

    default List<String> map(String groupNames) {
        if (groupNames == null || groupNames.isBlank()) {
            return List.of();
        }
        return Arrays.stream(groupNames.split(","))
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .toList();
    }
}
