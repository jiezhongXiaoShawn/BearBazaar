package com.bearbazzar.secondhandmarketbackend.service;

import com.bearbazzar.secondhandmarketbackend.exception.ItemNoExistException;
import com.bearbazzar.secondhandmarketbackend.exception.UserNotExistException;
import com.bearbazzar.secondhandmarketbackend.model.*;
import com.bearbazzar.secondhandmarketbackend.repository.ItemRepository;
import com.bearbazzar.secondhandmarketbackend.repository.UserRepository;
import net.bytebuddy.asm.Advice;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ItemService {
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;
    public ItemService(ItemRepository itemRepository,UserRepository userRepository,ImageService imageService) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.imageService = imageService;
    }
    public List<Item> GetUnsoldItem() {
        return itemRepository.findAllByStatus(Status.AVAILABLE);
    }
    public Item GetItemById(Long id) {
          return itemRepository.findById(id).orElse(null);
    }
    public void placeItem(Item item, MultipartFile[] images) {
        List<Image> imagesList = Arrays.stream(images)
                .filter(image -> !image.isEmpty())
                .parallel()
                .map(imageService::save)
                .map(mediaLink -> new Image(mediaLink, item))
                .collect(Collectors.toList());
        item.setImage(imagesList);
        if (!userRepository.existsByUsername(item.getOwner().getUsername())) {
            throw new UserNotExistException("user does not exist");
        }
        itemRepository.save(item);
    }
    public Item UpdateItem(Long id,String name,String category,String description,Double price,MultipartFile[] images){
          if(!itemRepository.existsById(id)){
                throw new ItemNoExistException("Item does not exists");
          }
          Optional<Item> optionalItem = itemRepository.findById(id);
          if(optionalItem.isPresent()){
                Item existItem = optionalItem.get();
                existItem.setName(name);
                existItem.setCategory(category);
                existItem.setDescription(description);
                existItem.setPrice(price);
                existItem.getImage().clear();
                List<Image> imagesList = Arrays.stream(images)
                        .filter(image -> !image.isEmpty())
                        .parallel()
                        .map(imageService::save)
                        .map(mediaLink -> new Image(mediaLink, existItem))
                        .collect(Collectors.toList());
                existItem.setImage(imagesList);
                return itemRepository.save(existItem);
          }
          return null;
    }
    public void deleteItem(Long id) {
        if(!itemRepository.existsById(id)) {
            throw new ItemNoExistException("Item does not exists");
        }
        Optional<Item> optionalItem = itemRepository.findById(id);
        if(optionalItem.isPresent()) {
            Item existItem = optionalItem.get();
            if( existItem.getStatus() != Status.AVAILABLE) {
                throw new ItemNoExistException("Item is sold, you can't delete it!");
            }
        }
        itemRepository.deleteById(id);
    }
    public List<Item> GetItemByOwner(User owner){
        if(!userRepository.existsByUsername(owner.getUsername())){
            throw new UserNotExistException("user does not exist");
        }
        return itemRepository.findAllByOwner(owner);
    }
    public List<Item> searchItem(Filter filter){
        Specification<Item> spec = Specification
                .where(ItemSpecifications.priceBetween(filter.getMinPrice(), filter.getMaxPrice()))
                .and(ItemSpecifications.hasCategory(filter.getCategory()))
                .and(ItemSpecifications.descriptionContains(filter.getContent()))
                .and(ItemSpecifications.nameContains(filter.getContent()));
        return itemRepository.findAll(spec);
    }

}
