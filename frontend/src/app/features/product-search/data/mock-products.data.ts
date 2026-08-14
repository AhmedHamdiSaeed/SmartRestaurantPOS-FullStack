// ============================================================
// Mock Product Dataset — 60+ products for search demo
// ============================================================
import { Product, ProductCategory } from '../../../core/models/product.model';

function makeProduct(
  id: string,
  name: string,
  category: ProductCategory,
  price: number,
  desc: string,
  tags: string[],
  allergens: string[],
  popular = false,
  prepTime = 10
): Product {
  return {
    id,
    name,
    sku: `SKU-${id.toUpperCase()}`,
    category,
    price,
    description: desc,
    allergens,
    calories: Math.round(price * 50 + Math.random() * 200),
    isAvailable: Math.random() > 0.08,
    isPopular: popular,
    preparationTime: prepTime,
    tags,
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    salesCount: Math.floor(Math.random() * 5000),
  };
}

export const MOCK_PRODUCTS: Product[] = [
  // Burgers
  makeProduct('b001','Classic Smash Burger','burgers',8.99,'Double smash patty with special sauce',['burger','beef','smash'],['gluten','dairy'],true,12),
  makeProduct('b002','Crispy Chicken Burger','burgers',9.49,'Buttermilk fried chicken, pickles, slaw',['chicken','crispy'],['gluten','dairy'],true,14),
  makeProduct('b003','Mushroom Swiss Burger','burgers',10.49,'Sautéed mushrooms, swiss cheese',['mushroom','cheese'],['gluten','dairy'],false,12),
  makeProduct('b004','BBQ Bacon Burger','burgers',11.99,'Smoked bacon, BBQ sauce, cheddar',['bbq','bacon'],['gluten','dairy','pork'],false,13),
  makeProduct('b005','Veggie Black Bean Burger','burgers',8.49,'Spiced black bean patty, avocado',['veggie','plant-based'],['gluten'],false,10),
  makeProduct('b006','Spicy Jalapeño Burger','burgers',9.99,'Jalapeño, pepper jack, sriracha',['spicy','hot'],['gluten','dairy'],false,12),
  makeProduct('b007','Truffle Mushroom Burger','burgers',13.99,'Truffle aioli, wild mushrooms',['premium','truffle'],['gluten','dairy'],false,15),
  makeProduct('b008','Double Stack Burger','burgers',12.49,'Two patties, special sauce, all toppings',['double','indulgent'],['gluten','dairy'],true,14),

  // Sandwiches
  makeProduct('s001','Club Sandwich','sandwiches',7.99,'Turkey, bacon, avocado, triple decker',['turkey','bacon'],['gluten','dairy'],false,8),
  makeProduct('s002','Philly Cheesesteak','sandwiches',10.99,'Shaved beef, peppers, onions, cheese',['beef','cheese'],['gluten','dairy'],false,12),
  makeProduct('s003','Grilled Chicken Wrap','sandwiches',8.49,'Grilled chicken, lettuce, tomato, tzatziki',['chicken','wrap'],['gluten','dairy'],true,10),
  makeProduct('s004','Falafel Wrap','sandwiches',7.49,'Homemade falafel, hummus, vegetables',['vegan','falafel'],['gluten','sesame'],false,8),
  makeProduct('s005','Tuna Melt','sandwiches',8.99,'Tuna salad, cheddar, tomato, grilled',['tuna','cheese'],['gluten','dairy','fish'],false,8),
  makeProduct('s006','BLT Sandwich','sandwiches',7.49,'Bacon, lettuce, tomato, mayo',['classic'],['gluten','dairy','pork'],false,6),

  // Pizza
  makeProduct('p001','Margherita Pizza','pizza',11.99,'Fresh mozzarella, tomato, basil',['cheese','classic'],['gluten','dairy'],true,18),
  makeProduct('p002','Pepperoni Pizza','pizza',13.49,'Lots of pepperoni, mozzarella',['meat','classic'],['gluten','dairy'],true,18),
  makeProduct('p003','BBQ Chicken Pizza','pizza',13.99,'Grilled chicken, BBQ sauce, red onion',['chicken','bbq'],['gluten','dairy'],false,20),
  makeProduct('p004','Veggie Supreme Pizza','pizza',12.49,'Bell peppers, mushrooms, olives, onions',['veggie'],['gluten','dairy'],false,18),
  makeProduct('p005','Four Cheese Pizza','pizza',14.49,'Mozzarella, cheddar, parmesan, brie',['cheese','premium'],['gluten','dairy'],false,18),
  makeProduct('p006','Spicy Meat Feast','pizza',15.99,'Pepperoni, sausage, beef, jalapeños',['meat','spicy'],['gluten','dairy'],false,20),

  // Pasta
  makeProduct('pa001','Spaghetti Bolognese','pasta',10.99,'Slow-cooked meat sauce, parmesan',['beef','classic'],['gluten','dairy'],true,15),
  makeProduct('pa002','Fettuccine Alfredo','pasta',11.49,'Creamy parmesan sauce, butter',['cream','classic'],['gluten','dairy'],false,12),
  makeProduct('pa003','Penne Arrabbiata','pasta',9.99,'Spicy tomato sauce, garlic',['spicy','vegan'],['gluten'],false,12),
  makeProduct('pa004','Seafood Linguine','pasta',14.99,'Shrimp, clams, mussels, white wine sauce',['seafood','premium'],['gluten','shellfish'],false,18),
  makeProduct('pa005','Lasagna al Forno','pasta',12.49,'Layered beef, béchamel, pasta',['beef','baked'],['gluten','dairy'],false,20),

  // Salads
  makeProduct('sa001','Caesar Salad','salads',7.99,'Romaine, croutons, parmesan, caesar dressing',['classic'],['gluten','dairy','eggs'],true,5),
  makeProduct('sa002','Greek Salad','salads',8.49,'Cucumber, tomato, feta, olives, oregano',['mediterranean'],['dairy'],false,5),
  makeProduct('sa003','Quinoa Power Bowl','salads',10.99,'Quinoa, roasted veggies, tahini',['healthy','vegan'],['sesame'],false,8),
  makeProduct('sa004','Cobb Salad','salads',11.49,'Chicken, avocado, bacon, blue cheese, egg',['hearty'],['dairy','eggs','pork'],false,8),
  makeProduct('sa005','Asian Sesame Salad','salads',9.49,'Mixed greens, mandarin, sesame dressing',['asian'],['sesame','gluten'],false,5),

  // Sides
  makeProduct('si001','Crispy Fries','sides',3.49,'Golden crispy seasoned fries',['classic'],['gluten'],true,6),
  makeProduct('si002','Sweet Potato Fries','sides',3.99,'Baked sweet potato fries, chipotle dip',['healthy'],['gluten'],false,8),
  makeProduct('si003','Onion Rings','sides',3.99,'Beer-battered onion rings',['crispy'],['gluten'],false,8),
  makeProduct('si004','Coleslaw','sides',2.49,'Creamy cabbage slaw',['side','fresh'],['dairy','eggs'],false,3),
  makeProduct('si005','Mac & Cheese','sides',4.49,'Creamy three-cheese mac',['comfort','cheese'],['gluten','dairy'],true,10),
  makeProduct('si006','Garlic Bread','sides',2.99,'Toasted garlic butter baguette',['bread','garlic'],['gluten','dairy'],false,5),

  // Desserts
  makeProduct('d001','Chocolate Lava Cake','desserts',5.99,'Warm chocolate cake, molten center, vanilla ice cream',['chocolate','indulgent'],['gluten','dairy','eggs'],true,12),
  makeProduct('d002','New York Cheesecake','desserts',5.49,'Classic NY style with berry compote',['classic','creamy'],['gluten','dairy','eggs'],true,3),
  makeProduct('d003','Tiramisu','desserts',5.99,'Coffee mascarpone Italian classic',['coffee','italian'],['gluten','dairy','eggs'],false,3),
  makeProduct('d004','Crème Brûlée','desserts',5.49,'Classic french vanilla, caramelized sugar',['premium','french'],['dairy','eggs'],false,3),
  makeProduct('d005','Banana Foster','desserts',5.99,'Caramelized banana, rum sauce, vanilla ice cream',['tropical'],['dairy'],false,8),
  makeProduct('d006','Chocolate Brownie','desserts',4.49,'Fudgy walnut brownie, chocolate sauce',['chocolate'],['gluten','dairy','eggs','nuts'],false,3),

  // Drinks
  makeProduct('dr001','Fresh Orange Juice','drinks',3.49,'Freshly squeezed orange juice',['fresh','vitamin-c'],[''],true,3),
  makeProduct('dr002','Iced Latte','drinks',3.99,'Espresso, cold milk, ice',['coffee','cold'],['dairy'],true,4),
  makeProduct('dr003','Mango Smoothie','drinks',4.49,'Fresh mango, yogurt, honey',['tropical','healthy'],['dairy'],false,4),
  makeProduct('dr004','Sparkling Water','drinks',1.99,'Premium sparkling mineral water',['zero-calorie'],[''],false,1),
  makeProduct('dr005','Craft Lemonade','drinks',3.49,'House-made fresh lemonade with mint',['fresh','classic'],[''],false,3),
  makeProduct('dr006','Chocolate Milkshake','drinks',4.99,'Thick chocolate shake, whipped cream',['indulgent','sweet'],['dairy'],false,5),
  makeProduct('dr007','Matcha Latte','drinks',4.49,'Ceremonial grade matcha, oat milk',['healthy','trendy'],[''],false,4),
  makeProduct('dr008','Classic Cola','drinks',1.99,'Ice cold cola',['classic','fizzy'],[''],false,1),

  // Combos
  makeProduct('c001','Burger & Fries Combo','combos',12.99,'Classic burger + fries + drink',['combo','value'],['gluten','dairy'],true,14),
  makeProduct('c002','Family Feast','combos',34.99,'4 burgers, 2 large fries, 4 drinks',['family','value'],['gluten','dairy'],false,18),
  makeProduct('c003','Pizza Party Box','combos',29.99,'2 medium pizzas + garlic bread + 2 drinks',['pizza','party'],['gluten','dairy'],false,22),
  makeProduct('c004','Lunch Special','combos',9.99,'Sandwich + side + drink',['lunch','value'],['gluten'],true,10),
  makeProduct('c005','Kids Meal','combos',6.99,'Slider + mini fries + juice box',['kids','small'],['gluten','dairy'],false,10),

  // Breakfast
  makeProduct('br001','Full English Breakfast','breakfast',9.99,'Eggs, bacon, sausage, beans, toast',['hearty','classic'],['gluten','dairy','pork','eggs'],true,15),
  makeProduct('br002','Avocado Toast','breakfast',7.99,'Sourdough, smashed avocado, poached egg',['healthy','trendy'],['gluten','eggs'],true,8),
  makeProduct('br003','Pancake Stack','breakfast',6.99,'Fluffy pancakes, maple syrup, butter',['sweet','fluffy'],['gluten','dairy','eggs'],false,10),
  makeProduct('br004','Eggs Benedict','breakfast',10.49,'Poached eggs, ham, hollandaise, english muffin',['classic','premium'],['gluten','dairy','eggs'],false,15),
  makeProduct('br005','Acai Bowl','breakfast',8.99,'Acai, granola, fresh fruits, honey',['healthy','vegan'],['nuts'],false,5),
  makeProduct('br006','Breakfast Burrito','breakfast',8.49,'Scrambled eggs, salsa, cheese, beans',['mexican','hearty'],['gluten','dairy','eggs'],false,10),
];
