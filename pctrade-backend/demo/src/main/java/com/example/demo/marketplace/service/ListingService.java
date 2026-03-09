package com.example.demo.marketplace.service;

import com.example.demo.auth.entity.User;
import com.example.demo.auth.repository.UserRepository;
import com.example.demo.marketplace.dto.ListingRequest;
import com.example.demo.marketplace.dto.ListingResponse;
import com.example.demo.marketplace.entity.*;
import com.example.demo.marketplace.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final MinioService minioService;

    public ListingResponse create(ListingRequest request, List<MultipartFile> images, String email) throws Exception {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Listing listing = new Listing();
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setCategory(request.getCategory());
        listing.setSeller(seller);

        Listing saved = listingRepository.save(listing);

        if (images != null) {
            for (MultipartFile image : images) {
                String url = minioService.uploadImage(image);
                ListingImage img = new ListingImage();
                img.setImageUrl(url);
                img.setListing(saved);
            }
            listingRepository.save(saved);
        }

        return toResponse(saved);
    }

    public List<ListingResponse> getAll() {
        return listingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ListingResponse getById(Long id) {
        return listingRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
    }

    public List<ListingResponse> getByCategory(Category category) {
        return listingRepository.findByCategory(category).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        listingRepository.deleteById(id);
    }

    private ListingResponse toResponse(Listing listing) {
        ListingResponse response = new ListingResponse();
        response.setId(listing.getId());
        response.setTitle(listing.getTitle());
        response.setDescription(listing.getDescription());
        response.setPrice(listing.getPrice());
        response.setCategory(listing.getCategory());
        response.setStatus(listing.getStatus());
        response.setSellerUsername(listing.getSeller().getUsername());
        response.setCreatedAt(listing.getCreatedAt());
        if (listing.getImages() != null) {
            response.setImageUrls(listing.getImages().stream()
                    .map(ListingImage::getImageUrl)
                    .collect(Collectors.toList()));
        }
        return response;
    }
}