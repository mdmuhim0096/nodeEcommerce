import { useEffect } from 'react';
import FeaturedProducts from '../components/FeaturedProducts';
import { useUserStore } from '../stores/useUserStore';
import { useProductStore } from '../stores/useProductStore';
import CategoryItem from '../components/CategoryItem';
const HomePage = () => {

  const { checkAuth } = useUserStore();
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
    checkAuth();
    fetchFeaturedProducts()
  }, [checkAuth, fetchFeaturedProducts])

  const categories = [
    { href: "/jeans", name: "Jeans", imageUrl: "./jeans.jpg" },
    { href: "/t-shirts", name: "T-shirts", imageUrl: "./tshirts.jpg" },
    { href: "/shoes", name: "Shoes", imageUrl: "./shoes.jpg" },
    { href: "/glasses", name: "Glasses", imageUrl: "./glasses.png" },
    { href: "/jackets", name: "Jackets", imageUrl: "./jackets.jpg" },
    { href: "/suits", name: "Suits", imageUrl: "./suits.jpg" },
    { href: "/bags", name: "Bags", imageUrl: "./bags.jpg" },
  ];

  return (
    <div className='relative min-h-screen text-white overflow-hidden'>
      <div className='relative z-10 max-w-7x1 mx-auto px-4 sm:px-6 1g:px-8 py-16'>
        <h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
          Explore Our Categories
        </h1>
        <p className='text-center text-xltext-gray-300 mb-12'>
          Discover the latest trends in eco-friendly fashion
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {categories.map(category => (
            <CategoryItem
              category={category}
              key={category.name}
            />
          ))}
        </div>
        {!isLoading && products?.length > 0 && <FeaturedProducts featuredProducts={products} />}
      </div>
    </div>
  );
}

export default HomePage