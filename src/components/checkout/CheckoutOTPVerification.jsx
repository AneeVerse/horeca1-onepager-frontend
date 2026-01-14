"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
import { FiSmartphone, FiCheck } from "react-icons/fi";
import { sendOTP, verifyOTP, resendOTP } from "@services/OTPServices";
import { notifySuccess, notifyError } from "@utils/toast";
import { UserContext } from "@context/UserContext";
import Cookies from "js-cookie";
import { getCookieOptions } from "@utils/cookieConfig";

const CheckoutOTPVerification = ({
    onVerified,
    initialPhone = "",
    onUserInfoUpdate
}) => {
    const { dispatch } = useContext(UserContext);
    const [step, setStep] = useState("phone"); // "phone" or "otp"
    const [phone, setPhone] = useState(initialPhone);
    const [displayPhone, setDisplayPhone] = useState(initialPhone);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [otpValues, setOtpValues] = useState(["", "", "", ""]);
    const [devOtp, setDevOtp] = useState(null);
    const otpInputRefs = useRef([]);
    const phoneInputRef = useRef(null);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Format phone number
    const formatPhoneNumber = (phoneNumber) => {
        const cleaned = phoneNumber.replace(/\D/g, "");
        if (cleaned.startsWith("0")) return cleaned.substring(1);
        if (cleaned.length === 10) return `91${cleaned}`;
        return cleaned;
    };

    // Handle phone input change
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
        setDisplayPhone(value);
    };

    // Handle phone submission
    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (loading || displayPhone.length < 10) return;

        setLoading(true);
        const formattedPhone = formatPhoneNumber(displayPhone);
        setPhone(formattedPhone);

        try {
            const result = await sendOTP(formattedPhone);
            if (result.success) {
                notifySuccess("OTP sent to your mobile");
                setStep("otp");
                setResendTimer(30);
                if (result.otp) setDevOtp(result.otp);
                setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
            } else {
                notifyError(result.message || "Failed to send OTP");
            }
        } catch (error) {
            notifyError(error.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input change
    const handleOTPChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        if (value && index < 3) {
            otpInputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 4 digits entered
        if (newOtpValues.every((val) => val !== "") && newOtpValues.length === 4) {
            handleOTPSubmit(newOtpValues.join(""));
        }
    };

    // Handle backspace
    const handleOTPKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handleOTPPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
        if (pastedData.length === 4) {
            const otpArray = pastedData.split("");
            setOtpValues(otpArray);
            otpArray.forEach((digit, index) => {
                if (otpInputRefs.current[index]) {
                    otpInputRefs.current[index].value = digit;
                }
            });
            setTimeout(() => handleOTPSubmit(pastedData), 100);
        }
    };

    // Handle OTP verification
    const handleOTPSubmit = async (otp) => {
        if (!otp || otp.length !== 4 || loading) return;

        setLoading(true);
        try {
            const result = await verifyOTP(phone, otp);

            if (result.success && result.userInfo) {
                const userInfoForCookie = {
                    ...result.userInfo,
                    id: result.userInfo._id,
                };

                // Set cookie with 30-day expiration
                Cookies.set("userInfo", JSON.stringify(userInfoForCookie), getCookieOptions(30));

                // Update context
                dispatch({ type: "USER_LOGIN", payload: userInfoForCookie });

                notifySuccess("Phone verified successfully!");

                // Callback to parent with user info
                if (onVerified) {
                    onVerified(userInfoForCookie);
                }
                if (onUserInfoUpdate) {
                    onUserInfoUpdate(userInfoForCookie);
                }
            } else {
                notifyError(result.error || "Invalid OTP. Please try again.");
                setOtpValues(["", "", "", ""]);
                otpInputRefs.current[0]?.focus();
            }
        } catch (error) {
            notifyError(error.message || "Failed to verify OTP");
            setOtpValues(["", "", "", ""]);
            otpInputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Handle resend OTP
    const handleResendOTP = async () => {
        if (resendTimer > 0 || loading) return;

        setLoading(true);
        try {
            const result = await resendOTP(phone);
            if (result.success) {
                notifySuccess("OTP sent again");
                setResendTimer(30);
                setOtpValues(["", "", "", ""]);
                otpInputRefs.current[0]?.focus();
            } else {
                notifyError(result.message || "Failed to resend OTP");
            }
        } catch (error) {
            notifyError(error.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FiSmartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">Verify Your Mobile</h3>
                    <p className="text-sm text-gray-500">Quick OTP verification to continue</p>
                </div>
            </div>

            {step === "phone" ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Mobile Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <span className="text-gray-500 font-medium">+91</span>
                            </div>
                            <input
                                ref={phoneInputRef}
                                type="tel"
                                inputMode="numeric"
                                value={displayPhone}
                                onChange={handlePhoneChange}
                                placeholder="Enter 10 digit number"
                                className="w-full pl-14 pr-4 py-3.5 text-lg font-medium border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || displayPhone.length < 10}
                        className="w-full py-3.5 px-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Sending OTP...</span>
                            </>
                        ) : (
                            <>
                                <span>Send OTP</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="space-y-4">
                    <button
                        onClick={() => {
                            setStep("phone");
                            setOtpValues(["", "", "", ""]);
                        }}
                        className="flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                    >
                        ← Change number
                    </button>

                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                            Enter OTP sent to{" "}
                            <span className="font-semibold text-emerald-600">
                                +91 {displayPhone.slice(0, 5)} {displayPhone.slice(5)}
                            </span>
                        </p>

                        {/* Dev mode OTP display */}
                        {devOtp && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
                                <p className="text-xs text-yellow-700">Dev OTP: <span className="font-bold">{devOtp}</span></p>
                            </div>
                        )}
                    </div>

                    {/* OTP Input Fields */}
                    <div className="flex justify-center gap-3">
                        {otpValues.map((value, index) => (
                            <input
                                key={index}
                                ref={(el) => (otpInputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={value}
                                onChange={(e) => handleOTPChange(index, e.target.value)}
                                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                onPaste={index === 0 ? handleOTPPaste : undefined}
                                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={() => handleOTPSubmit(otpValues.join(""))}
                        disabled={loading || otpValues.some((val) => !val)}
                        className="w-full py-3.5 px-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <FiCheck className="w-5 h-5" />
                                <span>Verify & Continue</span>
                            </>
                        )}
                    </button>

                    {/* Resend OTP */}
                    <div className="text-center">
                        {resendTimer > 0 ? (
                            <p className="text-sm text-gray-500">
                                Resend OTP in <span className="font-semibold text-emerald-600">{resendTimer}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResendOTP}
                                disabled={loading}
                                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                Didn't receive? Resend OTP
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutOTPVerification;
