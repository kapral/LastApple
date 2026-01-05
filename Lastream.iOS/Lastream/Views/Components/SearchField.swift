import SwiftUI

/// A generic search component with debounced search and selection support.
struct SearchField<T: Identifiable & Sendable>: View {
    /// The search function that returns matching items.
    let search: @Sendable (String) async throws -> [T]
    
    /// The placeholder text for the search field.
    let placeholder: String
    
    /// Function to get the display label for an item.
    let labelAccessor: (T) -> String
    
    /// Called when selection changes.
    let onChanged: ([T]) -> Void
    
    /// Whether to allow multiple selections.
    var allowMultiple: Bool = false
    
    @State private var searchText = ""
    @State private var isSearching = false
    @State private var searchResults: [T] = []
    @State private var selectedItems: [T] = []
    @State private var showResults = false
    @State private var searchTask: Task<Void, Never>?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Selected items
            if !selectedItems.isEmpty {
                FlowLayout(spacing: 8) {
                    ForEach(selectedItems) { item in
                        SelectedItemChip(
                            label: labelAccessor(item),
                            onRemove: { removeItem(item) }
                        )
                    }
                }
            }
            
            // Search field
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.appTextMuted)
                
                TextField(placeholder, text: $searchText)
                    .textFieldStyle(.plain)
                    .foregroundColor(.appText)
                    .autocorrectionDisabled()
                    .onChange(of: searchText) { _, newValue in
                        performSearch(query: newValue)
                    }
                
                if isSearching {
                    ProgressView()
                        .scaleEffect(0.8)
                } else if !searchText.isEmpty {
                    Button {
                        searchText = ""
                        searchResults = []
                        showResults = false
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.appTextMuted)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.appSecondaryBackground)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.appBorder, lineWidth: 1)
            )
            
            // Search results dropdown
            if showResults && !searchResults.isEmpty {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {
                        ForEach(searchResults) { item in
                            Button {
                                selectItem(item)
                            } label: {
                                Text(labelAccessor(item))
                                    .foregroundColor(.appText)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 10)
                            }
                            .buttonStyle(.plain)
                            
                            if item.id != searchResults.last?.id {
                                Divider()
                                    .background(Color.appBorder)
                            }
                        }
                    }
                }
                .frame(maxHeight: 200)
                .background(Color.appSecondaryBackground)
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.appBorder, lineWidth: 1)
                )
            }
        }
    }
    
    private func performSearch(query: String) {
        // Cancel previous search
        searchTask?.cancel()
        
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else {
            searchResults = []
            showResults = false
            return
        }
        
        // Debounce search
        searchTask = Task {
            try? await Task.sleep(for: .milliseconds(300))
            
            guard !Task.isCancelled else { return }
            
            await MainActor.run {
                isSearching = true
            }
            
            do {
                let results = try await search(query)
                
                guard !Task.isCancelled else { return }
                
                await MainActor.run {
                    searchResults = results
                    showResults = !results.isEmpty
                    isSearching = false
                }
            } catch {
                guard !Task.isCancelled else { return }
                
                await MainActor.run {
                    searchResults = []
                    showResults = false
                    isSearching = false
                }
            }
        }
    }
    
    private func selectItem(_ item: T) {
        if allowMultiple {
            if !selectedItems.contains(where: { $0.id == item.id }) {
                selectedItems.append(item)
            }
        } else {
            selectedItems = [item]
        }
        
        searchText = ""
        searchResults = []
        showResults = false
        onChanged(selectedItems)
    }
    
    private func removeItem(_ item: T) {
        selectedItems.removeAll { $0.id == item.id }
        onChanged(selectedItems)
    }
}

/// A chip view for selected items.
struct SelectedItemChip: View {
    let label: String
    let onRemove: () -> Void
    
    var body: some View {
        HStack(spacing: 4) {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.appText)
            
            Button(action: onRemove) {
                Image(systemName: "xmark")
                    .font(.caption)
                    .foregroundColor(.appTextMuted)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color.appAccent.opacity(0.2))
        .cornerRadius(16)
    }
}

/// A simple flow layout for wrapping items.
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(subviews: subviews, proposal: proposal)
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(subviews: subviews, proposal: proposal)
        
        for (index, frame) in result.frames.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + frame.minX, y: bounds.minY + frame.minY),
                proposal: ProposedViewSize(frame.size)
            )
        }
    }
    
    private func layout(subviews: Subviews, proposal: ProposedViewSize) -> (size: CGSize, frames: [CGRect]) {
        let maxWidth = proposal.width ?? .infinity
        var frames: [CGRect] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        var totalHeight: CGFloat = 0
        
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            
            if currentX + size.width > maxWidth && currentX > 0 {
                // Move to next line
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            
            frames.append(CGRect(x: currentX, y: currentY, width: size.width, height: size.height))
            
            currentX += size.width + spacing
            lineHeight = max(lineHeight, size.height)
            totalHeight = max(totalHeight, currentY + size.height)
        }
        
        return (CGSize(width: maxWidth, height: totalHeight), frames)
    }
}

// MARK: - String Search Support

/// A simple wrapper to make strings identifiable for search.
struct SearchableString: Identifiable, Sendable, Equatable {
    let id: String
    let value: String
    
    init(_ value: String) {
        self.id = value
        self.value = value
    }
}

#if DEBUG
#Preview {
    VStack {
        SearchField<SearchableString>(
            search: { query in
                try? await Task.sleep(for: .milliseconds(500))
                return ["Result 1", "Result 2", "Result 3"].map { SearchableString($0) }
            },
            placeholder: "Search...",
            labelAccessor: { $0.value },
            onChanged: { _ in }
        )
        .padding()
        
        Spacer()
    }
    .background(Color.appBackground)
}
#endif
