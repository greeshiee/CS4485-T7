import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar = () => {
    const links = [
        { to: '/#page1', label: '[page1]' },
        { to: '/#page2', label: '[page2]' },
        { to: '/#page3', label: '[page3]' },
    ];

    const {loginWithRedirect, logout, isAuthenticated} = useAuth0();

    const [isToggled, setIsToggled] = useState(false);

    const toggleNavlinks = () => {
        setIsToggled(prev => !prev);
    };

    useEffect(() => {
        const navlinks = document.querySelector("#navlinks");
        const hamburger = document.querySelector("#hamburger");
        const layer = document.querySelector("#navLayer");

        if (isToggled) {
            navlinks ? navlinks.classList.add("!visible", "!scale-100", "!opacity-100", "!lg:translate-y-0"): null;
            hamburger ? hamburger.classList.add("toggled") : null;
            layer ?layer.classList.add("origin-top", "scale-y-100"): null;
        } else {
            navlinks ? navlinks.classList.remove("!visible", "!scale-100", "!opacity-100", "!lg:translate-y-0"): null;
            hamburger ? hamburger.classList.remove("toggled"): null;
            layer ? layer.classList.remove("origin-top", "scale-y-100"): null;
        }
    }, [isToggled]);

    return (
        <header>
            <nav className="absolute z-10 w-full border-b border-black/5 dark:border-white/5 lg:border-transparent">
                <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 md:gap-0 md:py-4">
                        <div className="relative z-20 flex w-full justify-between md:px-0 lg:w-max">
                            <a href="/#home" aria-label="logo" className="flex items-center space-x-2">
                                <div aria-hidden="true" className="flex space-x-1">
                                    {'[Logo]'}
                                </div>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">[Project Name]</span>
                            </a>

                            <div className="relative flex max-h-10 items-center lg:hidden">
                                <button aria-label="hamburger" id="hamburger" className="relative -mr-6 p-6" onClick={toggleNavlinks}>
                                    <div aria-hidden="true" className="m-auto h-0.5 w-5 rounded bg-sky-900 transition duration-300 dark:bg-gray-300"></div>
                                    <div aria-hidden="true" className="m-auto mt-2 h-0.5 w-5 rounded bg-sky-900 transition duration-300 dark:bg-gray-300"></div>
                                </button>
                            </div>
                        </div>
                        <div id="navLayer" aria-hidden="true" className="fixed inset-0 z-10 h-screen w-screen origin-bottom scale-y-0 bg-white/70 backdrop-blur-2xl transition duration-500 dark:bg-gray-900/70 lg:hidden"></div>
                        <div id="navlinks" className="invisible absolute top-full left-0 z-20 w-full origin-top-right translate-y-1 scale-90 flex-col flex-wrap justify-end gap-6 rounded-3xl border border-gray-100 bg-white p-8 opacity-0 shadow-2xl shadow-gray-600/10 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none lg:visible lg:relative lg:flex lg:w-7/12 lg:translate-y-0 lg:scale-100 lg:flex-row lg:items-center lg:gap-0 lg:border-none lg:bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none">
                            <div className="w-full text-gray-600 dark:text-gray-200 lg:w-auto lg:pr-4 lg:pt-0">
                                <ul className="flex flex-col gap-6 tracking-wide lg:flex-row lg:gap-0 lg:text-sm">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <a href={link.to} className="hover:text-primary block transition dark:hover:text-white md:px-4">
                                                <span>{link.label}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-12 lg:mt-0">
                            {!isAuthenticated ? (
                                <button
                                onClick={() => loginWithRedirect()}
                                className="relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                                >
                                <span className="relative text-sm font-semibold text-white">Get Started</span>
                                </button>
                            ) : (
                                <button
                                onClick={() =>
                                    logout({
                                    logoutParams: { returnTo: window.location.origin },
                                    })
                                }
                                className="relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                                >
                                <span className="relative text-sm font-semibold text-white">Logout</span>
                                </button>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
