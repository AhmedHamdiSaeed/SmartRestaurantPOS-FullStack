package com.smartpos.product.config;

import com.smartpos.product.model.Product;
import com.smartpos.product.model.enums.ProductCategory;
import com.smartpos.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            List<Product> products = Arrays.asList(
                // BURGERS
                Product.builder().name("Classic Burger").nameAr("كلاسيك برجر").sku("BRG001").category(ProductCategory.BURGERS).price(45.0).description("Juicy beef patty with lettuce, tomato, pickles, and classic sauce.").allergens("gluten,dairy").calories(650).isPopular(true).preparationTime(12).tags("beef,classic,bestseller").rating(4.8).salesCount(1240).build(),
                Product.builder().name("Double Smash Burger").nameAr("دبل سماش برجر").sku("BRG002").category(ProductCategory.BURGERS).price(58.0).description("Two smashed beef patties, double cheddar cheese, caramelized onions.").allergens("gluten,dairy").calories(890).isPopular(true).preparationTime(15).tags("beef,smash,double").rating(4.9).salesCount(980).build(),
                Product.builder().name("Crispy Chicken Burger").nameAr("برجر دجاج مقرمش").sku("BRG003").category(ProductCategory.BURGERS).price(42.0).description("Crispy fried chicken breast with coleslaw and spicy mayo.").allergens("gluten,dairy,egg").calories(580).isPopular(false).preparationTime(10).tags("chicken,crispy").rating(4.6).salesCount(650).build(),
                Product.builder().name("Mushroom Swiss Burger").nameAr("مشروم سويس برجر").sku("BRG004").category(ProductCategory.BURGERS).price(52.0).description("Beef patty topped with sauteed mushrooms and melted Swiss cheese.").allergens("gluten,dairy").calories(720).isPopular(false).preparationTime(14).tags("beef,mushroom,swiss").rating(4.7).salesCount(510).build(),

                // SANDWICHES
                Product.builder().name("Grilled Chicken Sandwich").nameAr("ساندوتش دجاج مشوي").sku("SND001").category(ProductCategory.SANDWICHES).price(38.0).description("Marinated grilled chicken breast on toasted ciabatta.").allergens("gluten").calories(480).isPopular(true).preparationTime(10).tags("chicken,healthy").rating(4.7).salesCount(820).build(),
                Product.builder().name("Philly Cheesesteak").nameAr("فيلي تشيز ستيك").sku("SND002").category(ProductCategory.SANDWICHES).price(48.0).description("Sliced ribeye steak, melted provolone, onions, and green peppers.").allergens("gluten,dairy").calories(680).isPopular(false).preparationTime(12).tags("beef,steak,cheese").rating(4.8).salesCount(430).build(),

                // PIZZA
                Product.builder().name("Margherita Pizza").nameAr("بيتزا مارجريتا").sku("PZA001").category(ProductCategory.PIZZA).price(55.0).description("San Marzano tomato sauce, fresh mozzarella, and basil.").allergens("gluten,dairy").calories(800).isPopular(true).preparationTime(15).tags("pizza,vegetarian,classic").rating(4.9).salesCount(1100).build(),
                Product.builder().name("Pepperoni Pizza").nameAr("بيتزا بيبروني").sku("PZA002").category(ProductCategory.PIZZA).price(62.0).description("Classic pizza loaded with beef pepperoni and extra mozzarella.").allergens("gluten,dairy").calories(920).isPopular(true).preparationTime(15).tags("pizza,pepperoni").rating(4.8).salesCount(1450).build(),

                // PASTA
                Product.builder().name("Fettuccine Alfredo").nameAr("فيتوتشيني ألفريدو").sku("PST001").category(ProductCategory.PASTA).price(45.0).description("Fettuccine in creamy parmesan sauce with grilled chicken.").allergens("gluten,dairy").calories(750).isPopular(true).preparationTime(12).tags("pasta,creamy,chicken").rating(4.7).salesCount(780).build(),

                // SALADS
                Product.builder().name("Caesar Salad").nameAr("سلطة قيصر").sku("SLD001").category(ProductCategory.SALADS).price(28.0).description("Crisp romaine, parmesan cheese, croutons, and Caesar dressing.").allergens("dairy,egg,fish").calories(320).isPopular(true).preparationTime(6).tags("salad,healthy").rating(4.5).salesCount(620).build(),

                // SIDES
                Product.builder().name("French Fries").nameAr("بطاطس مقلية").sku("SDE001").category(ProductCategory.SIDES).price(15.0).description("Golden crispy seasoned fries.").allergens("").calories(380).isPopular(true).preparationTime(5).tags("sides,fries").rating(4.6).salesCount(2100).build(),
                Product.builder().name("Garlic Bread").nameAr("خبز بالثوم").sku("SDE002").category(ProductCategory.SIDES).price(18.0).description("Toasted baguette with garlic butter and herbs.").allergens("gluten,dairy").calories(280).isPopular(false).preparationTime(6).tags("sides,garlic").rating(4.5).salesCount(540).build(),

                // DESSERTS
                Product.builder().name("Chocolate Lava Cake").nameAr("كيكة الشوكولاتة الذائبة").sku("DST001").category(ProductCategory.DESSERTS).price(25.0).description("Warm chocolate cake with a molten fudge center.").allergens("gluten,dairy,egg").calories(450).isPopular(true).preparationTime(8).tags("dessert,chocolate").rating(4.9).salesCount(950).build(),

                // DRINKS
                Product.builder().name("Fresh Lemonade").nameAr("ليموناضة طازجة").sku("DRK001").category(ProductCategory.DRINKS).price(12.0).description("Freshly squeezed lemons with mint and ice.").allergens("").calories(120).isPopular(true).preparationTime(3).tags("drink,fresh").rating(4.8).salesCount(1600).build(),
                Product.builder().name("Cola").nameAr("كولا").sku("DRK002").category(ProductCategory.DRINKS).price(10.0).description("Chilled carbonated soft drink.").allergens("").calories(140).isPopular(false).preparationTime(1).tags("drink,soda").rating(4.4).salesCount(1900).build()
            );

            productRepository.saveAll(products);
        }
    }
}
