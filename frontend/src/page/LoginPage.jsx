import { useState } from 'react';
import { Loader, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from '../stores/useUserStore';
import { Link } from 'react-router-dom';
import Confetti from "react-confetti"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const fields = [
    {
      label: "Email",
      type: "email",
      placeholder: "Email",
      Icon: Mail,
      stateKey: "email"
    },
    {
      label: "Password",
      type: "password",
      placeholder: "Password",
      Icon: Lock,
      stateKey: "password"
    }
  ];

  const { loading, login } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className='flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={10000}
        recycle={false}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>
          Login
        </h2>
      </motion.div>

      <motion.div
        className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 rounded-md'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {fields.map((field, index) => (
              <div key={index}>
                <label htmlFor={field.stateKey} className='block text-sm font-medium text-gray-300'>
                  {field.label}
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <field.Icon className='h-5 w-5 text-gray-400' aria-hidden='true' />
                  </div>
                  <input
                    id={field.stateKey}
                    type={field.type}
                    required
                    value={formData[field.stateKey]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.stateKey]: e.target.value })
                    }
                    className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-emerald-500 sm:text-sm'
                    placeholder={field.placeholder}
                  />
                </div>
              </div>
            ))}

            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
            >
              <div className='flex items-center justify-center gap-2'
              >
                <Loader className={`${loading ? "block animate-spin" : "animate-none hidden"}`} />
                <span>Login</span>
              </div>
            </button>
          </form>
          <div>if need to <Link to={"/signup"} className='underline my-1 inline-block'>signup</Link></div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
