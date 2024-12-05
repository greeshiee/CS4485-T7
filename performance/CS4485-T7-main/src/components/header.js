import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Hamburger from 'hamburger-react';


const Navbar = () => {
    const links = [
        { to: '/#page1', label: 'About Us' },
        { to: '/#page2', label: 'SRS Documents' },
        { to: '/#page3', label: 'Integration Guides' },
    ];

    const hamburgerLinks = [
        { to: '/usecase1', label: 'T1 : Exploratory Data Analysis' },
        { to: '/#usecase2', label: 'T2 : Data Ingestion' },
        { to: '/#usecase3', label: 'T3 : Dashboarding' },
        { to: 'http://localhost:6789/', label: 'T4 : Data Pipelining' },
        { to: '/#usecase5', label: 'T5 : KPI Fomulas' },
        { to: '/#usecase6', label: 'T6 : Data Generation' },
        { to: '/#usecase7', label: 'T7 : Security Management' },
        { to: '/#usecase8', label: 'T8 : Fault Management' },
        { to: '/#usecase9', label: 'T9 : Performance Metrics' },
    ];

    const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

    const [isToggled, setIsToggled] = useState(false);

    const toggleNavlinks = () => {
        setIsToggled(prev => !prev);
    };

    useEffect(() => {
        const navlinks = document.querySelector("#navlinks");
        const hamburger = document.querySelector("#hamburger");
        const layer = document.querySelector("#navLayer");

        if (isToggled) {
            if (navlinks) {
              navlinks.classList.add("!visible", "!scale-100", "!opacity-100", "!lg:translate-y-0");
            }
            if (hamburger) {
              hamburger.classList.add("toggled");
            }
            if (layer) {
              layer.classList.add("origin-top", "scale-y-100");
            }
          } else {
            if (navlinks) {
              navlinks.classList.remove("!visible", "!scale-100", "!opacity-100", "!lg:translate-y-0");
            }
            if (hamburger) {
              hamburger.classList.remove("toggled");
            }
            if (layer) {
              layer.classList.remove("origin-top", "scale-y-100");
            }
          }
    }, [isToggled]);

    return (
        <header>
            <nav className="absolute z-10 w-full border-b border-black/5 dark:border-white/5 lg:border-transparent">
                <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 md:gap-0 md:py-4">
                        <div className="relative z-20 flex w-full justify-between md:px-0 lg:w-max">
                            <div >
                                {isAuthenticated && (
                                <Hamburger  toggled={isToggled}  toggle = {setIsToggled}    direction="right"   />
                                )}
                                    {isToggled && isAuthenticated &&(
                                        <div className="absolute left-0 top-full mt-2 w-61 bg-gray-100 dark:bg-gray-800 p-4 shadow-lg rounded-lg">
                                            <ul className="flex flex-col space-y-2">
                                                {hamburgerLinks.map((link) => (
                                                    <li key={link.label}>
                                                        <Link to={link.to}>
                                                            <span className="block text-gray-900 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition">
                                                                {link.label}
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                            </div>
                            <a href="/splash" aria-label="logo" className="flex items-center space-x-2 text-2xl">
                                <div aria-hidden="true" className="flex space-x-1">
                                    {<div className="h-[1.5em] w-[1.5em] flex justify-center items-center overflow-hidden rounded-full">
                                        <img src="/assets/logo.png" alt="Logo" className="object-cover h-full w-full" />
                                    </div>}
                                </div>
                                <span className="text-2xl font-medium text-electricblue dark:text-white">NodeWave</span>
                            </a>
                            <div className="relative flex max-h-10 items-center lg:hidden">
                            <button aria-label="hamburger" id="hamburger" className="relative -mr-6 p-6" onClick={toggleNavlinks}>
                                <div aria-hidden="true" className="m-auto h-0.5 w-5 rounded bg-white transition duration-300 dark:bg-white"></div>
                                <div aria-hidden="true" className="m-auto mt-2 h-0.5 w-5 rounded bg-white transition duration-300 dark:bg-white"></div>
                            </button>
                        </div>

                        </div>
                        <div id="navLayer" aria-hidden="true" className="fixed inset-0 z-10 h-screen w-screen origin-bottom scale-y-0 bg-white/70 backdrop-blur-2xl transition duration-500 dark:bg-gray-900/70 lg:hidden"></div>
                        <div id="navlinks" className="invisible absolute top-full left-0 z-20 w-full origin-top-right translate-y-1 scale-90 flex-col flex-wrap justify-end gap-6 rounded-3xl border border-gray-100 bg-white p-8 opacity-0 shadow-2xl shadow-gray-600/10 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none lg:visible lg:relative lg:flex lg:w-7/12 lg:translate-y-0 lg:scale-100 lg:flex-row lg:items-center lg:gap-0 lg:border-none lg:bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none">
                            <div className="w-full text-lightgray dark:text-gray-200 lg:w-auto lg:pr-4 lg:pt-0">
                                <ul className="flex flex-col gap-6 tracking-wide lg:flex-row lg:gap-0 lg:text-sm">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <Link to={link.to} className="hover:text-electricblue block transition dark:hover:text-white md:px-4">
                                                <span>{link.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-12 lg:mt-0">
                            {!isAuthenticated ? (
                                <button
                                onClick={() => loginWithRedirect()}
                                className="relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-electricblue dark:before:bg-blue-950 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                                >
                                <span className="relative text-sm font-semibold text-background">Get Started</span>
                                </button>
                            ) : (
                                <button
                                onClick={() =>
                                    logout({
                                    logoutParams: { returnTo: window.location.origin },
                                    })
                                }
                                className="relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-electricblue dark:before:bg-blue-950 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                                >
                                <span className="relative text-sm font-semibold text-background">Logout</span>
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

