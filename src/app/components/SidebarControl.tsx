"use client";

import { useEffect } from "react";

export default function SidebarControl() {

    const toggleLeftbar = () => {
        const body = document.querySelector('.l_body');
        if (body) {
            if (body.getAttribute('leftbar') !== null) {
                body.removeAttribute('leftbar');
            } else {
                body.setAttribute('leftbar', '');
                body.removeAttribute('rightbar');
            }
        }
    };

    const toggleRightbar = () => {
        const body = document.querySelector('.l_body');
        if (body) {
            if (body.getAttribute('rightbar') !== null) {
                body.removeAttribute('rightbar');
            } else {
                body.setAttribute('rightbar', '');
                body.removeAttribute('leftbar');
            }
        }
    };

    const dismiss = () => {
        const body = document.querySelector('.l_body');
        if (body) {
            body.removeAttribute('leftbar');
            body.removeAttribute('rightbar');
        }
    };

    return (
        <>
            <div className='float-panel'>
                <button type='button' style={{ display: 'none' }} className='laptop-only rightbar-toggle mobile' onClick={toggleRightbar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6h11m-11 6h11m-11 6h11M4 6h1v4m-1 0h2m0 8H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
                </button>
                <button type='button' style={{ display: 'none' }} className='mobile-only leftbar-toggle mobile' onClick={toggleLeftbar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11c0-3.771 0-5.657 1.172-6.828C4.343 3 6.229 3 10 3h4c3.771 0 5.657 0 6.828 1.172C22 5.343 22 7.229 22 11v2c0 3.771 0 5.657-1.172 6.828C19.657 21 17.771 21 14 21h-4c-3.771 0-5.657 0-6.828-1.172C2 18.657 2 16.771 2 13z" /><path id="sep" strokeLinecap="round" d="M5.5 10h6m-5 4h4m4.5 7V3" /></g></svg>
                </button>
            </div>
            <div className="main-mask" onClick={dismiss}></div>
        </>
    );
}
