package com.mict.ebook.workspace.repository.mapper;

import com.mict.ebook.workspace.domain.Workspace;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkspaceMapper {

    List<Workspace> findAll();
}
