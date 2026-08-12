package com.mict.ebook.workspace.mapper;

import com.mict.ebook.workspace.domain.Workspace;
import com.mict.ebook.workspace.dto.WorkspaceResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WorkspaceRestMapper {

    WorkspaceResponse toResponse(Workspace workspace);
}
