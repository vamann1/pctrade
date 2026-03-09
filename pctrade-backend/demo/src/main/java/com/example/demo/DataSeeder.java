package com.example.demo;

import com.example.demo.auth.entity.Role;
import com.example.demo.auth.entity.User;
import com.example.demo.auth.repository.UserRepository;
import com.example.demo.marketplace.entity.Category;
import com.example.demo.marketplace.entity.Listing;
import com.example.demo.marketplace.entity.ListingStatus;
import com.example.demo.marketplace.repository.ListingRepository;
import com.example.demo.transactions.entity.Transaction;
import com.example.demo.transactions.entity.TransactionStatus;
import com.example.demo.transactions.repository.TransactionRepository;
import com.example.demo.chat.entity.Message;
import com.example.demo.chat.entity.MessageType;
import com.example.demo.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final TransactionRepository transactionRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // Useri de test
        User user1 = createUser("ion@test.com", "Ion Popescu", "parola123");
        User user2 = createUser("maria@test.com", "Maria Ionescu", "parola123");
        User user3 = createUser("alex@test.com", "Alex Popa", "parola123");
        User admin = createUser("admin@pctrade.com", "Admin", "admin123");
        admin.setRole(Role.ROLE_ADMIN);
        userRepository.save(admin);

        // Listings
        Listing l1 = createListing("RTX 4090 MSI Gaming X", "Placa video noua, sigilata", new BigDecimal("6500"), Category.GPU, ListingStatus.ACTIVE, user1);
        Listing l2 = createListing("Intel Core i9-13900K", "Procesor folosit 6 luni", new BigDecimal("2200"), Category.CPU, ListingStatus.ACTIVE, user1);
        Listing l3 = createListing("AMD Ryzen 9 7950X", "Procesor nou, nedesfacut", new BigDecimal("2800"), Category.CPU, ListingStatus.ACTIVE, user2);
        Listing l4 = createListing("ASUS ROG Strix B650E", "Placa de baza AM5", new BigDecimal("1500"), Category.MOTHERBOARD, ListingStatus.ACTIVE, user2);
        Listing l5 = createListing("Corsair Vengeance 32GB DDR5", "RAM 6000MHz, dual channel", new BigDecimal("800"), Category.RAM, ListingStatus.ACTIVE, user3);
        Listing l6 = createListing("Samsung 980 Pro 2TB", "SSD NVMe Gen4", new BigDecimal("700"), Category.STORAGE, ListingStatus.ACTIVE, user3);
        Listing l7 = createListing("Seasonic Focus GX-1000", "PSU 80+ Gold, 1000W", new BigDecimal("600"), Category.PSU, ListingStatus.ACTIVE, user1);
        Listing l8 = createListing("Lian Li O11 Dynamic", "Case full tower", new BigDecimal("550"), Category.CASE, ListingStatus.ACTIVE, user2);
        Listing l9 = createListing("Noctua NH-D15", "Cooler dual tower", new BigDecimal("350"), Category.COOLING, ListingStatus.ACTIVE, user3);
        Listing l10 = createListing("RTX 3080 EVGA FTW3", "Placa video, garantie 1 an", new BigDecimal("2500"), Category.GPU, ListingStatus.ACTIVE, user1);
        Listing l11 = createListing("AMD RX 7900 XTX", "Placa video noua", new BigDecimal("3500"), Category.GPU, ListingStatus.ACTIVE, user2);
        Listing l12 = createListing("Intel Core i7-13700K", "Procesor, pasta inclusa", new BigDecimal("1600"), Category.CPU, ListingStatus.ACTIVE, user3);
        Listing l13 = createListing("G.Skill Trident Z5 64GB", "RAM DDR5 6400MHz", new BigDecimal("1200"), Category.RAM, ListingStatus.ACTIVE, user1);
        Listing l14 = createListing("WD Black SN850X 1TB", "SSD NVMe Gen4", new BigDecimal("450"), Category.STORAGE, ListingStatus.SOLD, user2);
        Listing l15 = createListing("be quiet! Dark Power 13 1000W", "PSU 80+ Titanium", new BigDecimal("900"), Category.PSU, ListingStatus.ACTIVE, user3);

        // Tranzactii
        createTransaction(user2, user1, l1, TransactionStatus.COMPLETED, "pi_test_001");
        createTransaction(user3, user2, l4, TransactionStatus.FUNDS_LOCKED, "pi_test_002");
        createTransaction(user1, user3, l5, TransactionStatus.INITIATED, "pi_test_003");
        createTransaction(user2, user3, l6, TransactionStatus.DELIVERED, "pi_test_004");
        createTransaction(user3, user1, l10, TransactionStatus.CONFIRMED, "pi_test_005");

        // Mesaje
        createMessage(user2, user1, l1, MessageType.TEXT, "Salut! Mai e disponibila placa?", null);
        createMessage(user1, user2, l1, MessageType.TEXT, "Da, e disponibila!", null);
        createMessage(user2, user1, l1, MessageType.OFFER, "Fac 6000 ron?", new BigDecimal("6000"));
        createMessage(user1, user2, l1, MessageType.TEXT, "Merge, hai sa facem tranzactia.", null);
        createMessage(user3, user2, l4, MessageType.TEXT, "Ce socket are placa?", null);
        createMessage(user2, user3, l4, MessageType.TEXT, "AM5, compatibila cu Ryzen 7000.", null);

        System.out.println("✅ Date de test inserate cu succes!");
    }

    private User createUser(String email, String username, String password) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    private Listing createListing(String title, String description, BigDecimal price,
                                  Category category, ListingStatus status, User seller) {
        Listing listing = new Listing();
        listing.setTitle(title);
        listing.setDescription(description);
        listing.setPrice(price);
        listing.setCategory(category);
        listing.setStatus(status);
        listing.setSeller(seller);
        listing.setCreatedAt(LocalDateTime.now());
        return listingRepository.save(listing);
    }

    private void createTransaction(User buyer, User seller, Listing listing,
                                   TransactionStatus status, String paymentIntentId) {
        Transaction t = new Transaction();
        t.setBuyer(buyer);
        t.setSeller(seller);
        t.setListing(listing);
        t.setStatus(status);
        t.setStripePaymentIntentId(paymentIntentId);
        t.setAmount(listing.getPrice());
        transactionRepository.save(t);
    }

    private void createMessage(User sender, User receiver, Listing listing,
                               MessageType type, String content, BigDecimal offerAmount) {
        Message m = new Message();
        m.setSender(sender);
        m.setReceiver(receiver);
        m.setListing(listing);
        m.setType(type);
        m.setContent(content);
        m.setOfferAmount(offerAmount);
        m.setCreatedAt(LocalDateTime.now());
        messageRepository.save(m);
    }
}