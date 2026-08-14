package com.mict.ebook.bookset.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateBookSetBooksRequest(@NotNull List<Long> bookIds) {}
