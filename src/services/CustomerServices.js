"use server";

import { baseURL, handleResponse } from "@services/CommonService";
import { getHeaders, getUserServerSession } from "@lib/auth-server";

const loginCustomer = async ({ email, password }) => {
  // console.log("registerEmail", email, "password", password);
  // return;
  try {
    const response = await fetch(`${baseURL}/customer/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const userInfo = await handleResponse(response);

    // revalidatePath("/auth/login");
    // console.log("userInfo", userInfo);
    return {
      userInfo,
    };
  } catch (error) {
    // console.log("error on login::", error.message);
    return { error: error.message };
  }
};

const registerCustomer = async (token) => {
  try {
    const response = await fetch(`${baseURL}/customer/register/${token}`, {
      cache: "no-cache",
    });

    const user = await handleResponse(response);
    return { user, error: null };
  } catch (error) {
    return { user: [], error: error.message };
  }
};
const signUpWithOauthProvider = async ({ name, email, image }) => {
  // return;
  try {
    const response = await fetch(`${baseURL}/customer/signup/oauth`, {
      cache: "no-cache",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, image }),
    });

    const res = await handleResponse(response);
    // console.log("res", res);
    return { res };
  } catch (error) {
    return { error: error.message };
  }
};
const forgetPassword = async () => {
  try {
    const response = await fetch(`${baseURL}/customer/forget-password`, {
      cache: "no-cache",
    });

    const user = await handleResponse(response);
    return { user, error: null };
  } catch (error) {
    return { user: [], error: error.message };
  }
};

const resetPassword = async () => {
  try {
    const response = await fetch(`${baseURL}/customer/reset-password`, {
      cache: "no-cache",
    });

    const user = await handleResponse(response);
    return { user, error: null };
  } catch (error) {
    return { user: [], error: error.message };
  }
};

const getShippingAddress = async ({ id = "" }) => {
  try {
    // return;
    const userInfo = await getUserServerSession();
    // console.log("userInfo", userInfo);
    const response = await fetch(
      `${baseURL}/customer/shipping/address/${userInfo?.id || userInfo?._id}?id=${id}`,
      {
        cache: "no-store",
        headers: await getHeaders(),
      }
    );

    const res = await handleResponse(response);
    // console.log("shippingAddress", res);

    return {
      shippingAddress: res.shippingAddress,
      shippingAddresses: res.shippingAddresses || [], // Return all addresses
    };
  } catch (error) {
    // console.log("error", error);
    return { error: error.message, shippingAddresses: [] };
  }
};

const getCustomerById = async (customerId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${baseURL}/customer/${customerId}`, {
      cache: "no-store",
      headers,
    });

    const customer = await handleResponse(response);
    return { customer, error: null };
  } catch (error) {
    return { customer: null, error: error.message };
  }
};

const getAllCustomers = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${baseURL}/customer`, {
      cache: "no-store",
      headers,
    });

    const customers = await handleResponse(response);
    return { customers, error: null };
  } catch (error) {
    return { customers: [], error: error.message };
  }
};

export {
  loginCustomer,
  registerCustomer,
  signUpWithOauthProvider,
  forgetPassword,
  resetPassword,
  getShippingAddress,
  getCustomerById,
  getAllCustomers,
};

