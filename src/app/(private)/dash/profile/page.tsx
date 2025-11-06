"use client";
import { useAuth } from "@/context/AuthContext";
import { AuthAPI } from "@/lib/api";
import { User } from "@/types/auth";
import { div } from "framer-motion/client";
import { ArrowLeft, CheckCheck, Edit, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {};

const page = (props: Props) => {
  const router = useRouter();
  const { user, setUser } = useAuth();
  //console.log("Current user object: ", user);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUserData, setNewUserData] = useState<any>({
    id: "",
    name: "",
    phone: {
      e164: "",
      verified: false,
    },
    gender: "",
    dob: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
    },
    height: {
      value: 0,
      unit: "",
    },
    weight: {
      value: 0,
      unit: "",
    },
    profilePicture: {
      original: null,
      thumbnail: null,
      uploadedAt: null,
    },
  });

  // Update newUserData when user data is loaded
  useEffect(() => {
    if (user) {
      setNewUserData({
        id: user.id || "",
        name: user.name || "",
        phone: {
          e164: user.phone?.e164 || "",
          verified: user.phone?.verified || false,
        },
        gender: user.gender || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipcode: user.address?.zipcode || "",
          country: user.address?.country || "",
        },
        height: {
          value: user.height?.value || 0,
          unit: user.height?.unit || "",
        },
        weight: {
          value: user.weight?.value || 0,
          unit: user.weight?.unit || "",
        },
        profilePicture: {
          original: user.profilePicture?.original || null,
          thumbnail: user.profilePicture?.thumbnail || null,
          uploadedAt: user.profilePicture?.uploadedAt || null,
        },
      });
      setProfilePicture(null);
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDiscardChanges = () => {
    if (user) {
      setNewUserData({
        id: user.id || "",
        name: user.name || "",
        phone: {
          e164: user.phone?.e164 || "",
          verified: user.phone?.verified || false,
        },
        gender: user.gender || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipcode: user.address?.zipcode || "",
          country: user.address?.country || "",
        },
        height: {
          value: user.height?.value || 0,
          unit: user.height?.unit || "",
        },
        weight: {
          value: user.weight?.value || 0,
          unit: user.weight?.unit || "",
        },
        profilePicture: {
          original: user.profilePicture?.original || null,
          thumbnail: user.profilePicture?.thumbnail || null,
          uploadedAt: user.profilePicture?.uploadedAt || null,
        },
      });
    }
    setProfilePicture(null);
    setIsEditing(false);
  };

  const handleSaveUpdate = async () => {
    // Ensure we have a valid user ID before making API calls
    if (!user?.id || !newUserData.id) {
      console.error("Cannot save: user ID is missing");
      return;
    }
    if (profilePicture) {
      try {
        // Upload profile picture logic here
        const formData = new FormData();
        formData.append("profilePicture", profilePicture);
        // Use user.id instead of user?.id || "" to ensure we have a valid ID
        const res = await AuthAPI.uploadProfileImage(user.id, formData);
        if (res) {
          console.log("Response of profile picture update user: ", res.user);
          setProfilePicture(null);
        }
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
      }
    }
    if (newUserData) {
      // Call API to update user data
      try {
        const res = await AuthAPI.updateUser({
          id: newUserData.id,
          name: newUserData.name,
          phone: newUserData.phone,
          gender: newUserData.gender,
          dob: newUserData.dob,
          address: newUserData.address,
          height: newUserData.height,
          weight: newUserData.weight,
        });
        console.log("User updated successfully:", res);
        if (res && res.user) {
          setNewUserData({
            id: res.user.id || "",
            name: res.user.name || "",
            phone: {
              e164: res.user.phone?.e164 || "",
              verified: res.user.phone?.verified || false,
            },
            gender: res.user.gender || "",
            dob: res.user.dob
              ? new Date(res.user.dob).toISOString().split("T")[0]
              : "",
            address: {
              street: res.user.address?.street || "",
              city: res.user.address?.city || "",
              state: res.user.address?.state || "",
              zipcode: res.user.address?.zipcode || "",
              country: res.user.address?.country || "",
            },
            height: {
              value: res.user.height?.value || 0,
              unit: res.user.height?.unit || "",
            },
            weight: {
              value: res.user.weight?.value || 0,
              unit: res.user.weight?.unit || "",
            },
            profilePicture: {
              original: res.user.profilePicture?.original || null,
              thumbnail: res.user.profilePicture?.thumbnail || null,
              uploadedAt: res.user.profilePicture?.uploadedAt || null,
            },
          });
          setUser(res.user);
        }
      } catch (error) {
        console.error("Failed to update user:", error);
      }
    }

    // Implement save logic here
    setIsEditing(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center px-4 gap-4">
      <div className="w-full py-4 flex items-center gap-4">
        <span>
          <ArrowLeft
            onClick={() => router.back()}
            className="size-[24px] hover:text-lime-500 cursor-pointer"
          />
        </span>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>
      <div className="w-full flex flex-col items-center gap-4 py-4 border-b border-neutral-200">
        <div className="size-[240px] lg:size-[300px] rounded-full bg-neutral-400 border border-neutral-200 flex items-center justify-center">
          {profilePicture && (
            <img
              src={URL.createObjectURL(profilePicture)}
              alt="Profile"
              className="rounded-full w-full h-full object-cover"
            />
          )}
          {!profilePicture && user?.profilePicture?.original && (
            <img
              src={user.profilePicture.original}
              alt="Profile"
              className="rounded-full w-full h-full object-cover "
            />
          )}
        </div>
        {isEditing && (
          <div className="flex items-center justify-center w-full max-w-[300px] mx-auto gap-2 p-4">
            <input
              type="file"
              placeholder="Upload Profile Picture"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProfilePicture(e.target.files[0]);
                }
              }}
              accept="image/*"
              className="w-full items-center justify-center text-center cursor-pointer px-4 py-2 border border-neutral-200 rounded-md"
            />
          </div>
        )}
        <div className="w-full flex items-center justify-between gap-2">
          <p className="text-lg font-medium">Personal Details</p>
          {isEditing ? (
            <div className="flex gap-4">
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 text-xs rounded-md border border-neutral-200 bg-black text-white hover:bg-neutral-400 cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> <span>Discard Changes</span>
              </button>
              <button
                onClick={handleSaveUpdate}
                className="px-4 py-2 text-xs rounded-md border border-neutral-200 bg-lime-700 text-white hover:bg-lime-900 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCheck size={16} /> <span>Save Changes</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 text-xs rounded-md border border-neutral-200 bg-black text-white hover:bg-neutral-400 cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit size={16} /> <span>Edit</span>
            </button>
          )}
        </div>
        <div className="w-full grid grid-cols-1 min-[425px]:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col items-start grow">
            <p className="text-base text-neutral-400">Name</p>
            {isEditing ? (
              <input
                type="text"
                value={newUserData.name}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, name: e.target.value })
                }
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
              />
            ) : (
              <p className="text-base font-medium ">{user?.name}</p>
            )}
          </div>
          <div className=" flex flex-col items-start grow">
            <p className="text-base text-neutral-400">Email</p>
            <p className="text-base font-medium ">{user?.email}</p>
          </div>
          <div className=" flex flex-col items-start grow">
            <p className="text-base text-neutral-400">Phone Number</p>
            {isEditing ? (
              <input
                type="tel"
                value={newUserData.phone.e164}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    phone: { ...newUserData.phone, e164: e.target.value },
                  })
                }
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
              />
            ) : (
              <p className="text-base font-medium ">
                {newUserData.phone.e164 || "Not specified"}
              </p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">Gender</p>
            {isEditing ? (
              <select
                value={newUserData.gender}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, gender: e.target.value })
                }
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-base font-medium ">
                {newUserData.gender || "Not specified"}
              </p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">Date of Birth</p>
            {isEditing ? (
              <input
                type="date"
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
                value={newUserData.dob}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, dob: e.target.value })
                }
              />
            ) : (
              <p className="text-base font-medium ">
                {newUserData.dob ? newUserData.dob : "Not specified"}
              </p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">Address</p>
            {isEditing ? (
              <input
                type="text"
                value={newUserData.address.street}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    address: {
                      ...newUserData.address,
                      street: e.target.value,
                    },
                  })
                }
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
              />
            ) : (
              <p className="text-base font-medium ">
                {newUserData.address.street || "Not specified"}
              </p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">City</p>
            {isEditing ? (
              <input
                type="text"
                value={newUserData.address.city}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    address: {
                      ...newUserData.address,
                      city: e.target.value,
                    },
                  })
                }
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
              />
            ) : (
              <p className="text-base font-medium ">
                {newUserData.address.city || "Not specified"}
              </p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">State</p>
            {isEditing ? (
              <input
                type="text"
                value={newUserData.address.state}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    address: {
                      ...newUserData.address,
                      state: e.target.value,
                    },
                  })
                }
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
              />
            ) : (
              <p className="text-base font-medium ">
                {newUserData.address.state || "Not specified"}
              </p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">Country</p>
            {isEditing ? (
              <input
                type="text"
                value={newUserData.address.country}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    address: {
                      ...newUserData.address,
                      country: e.target.value,
                    },
                  })
                }
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
              />
            ) : (
              <p className="text-base font-medium ">
                {newUserData.address.country || "Not specified"}
              </p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">Zipcode</p>
            {isEditing ? (
              <input
                type="text"
                value={newUserData.address.zipcode}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    address: {
                      ...newUserData.address,
                      zipcode: e.target.value,
                    },
                  })
                }
                className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
              />
            ) : (
              <p className="text-base font-medium ">
                {newUserData.address.zipcode || "Not specified"}
              </p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">Height</p>
            {isEditing ? (
              <div className="flex items-center gap-4">
                <div className="flex-col">
                  <label htmlFor="heightFt">Ft</label>
                  <input
                    id="heightFt"
                    type="text"
                    className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
                  />
                </div>
                <div className="flex-col">
                  <label htmlFor="heightIn">In</label>
                  <input
                    id="heightIn"
                    type="text"
                    className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
                  />
                </div>
              </div>
            ) : (
              <p className="text-base font-medium ">6'0"</p>
            )}
          </div>
          <div className="flex flex-col grow items-start">
            <p className="text-base text-neutral-400">Weight</p>
            {isEditing ? (
              <div className="flex items-center gap-4">
                <div className="flex-col">
                  <label htmlFor="weightLbs">Lbs</label>
                  <input
                    id="weightLbs"
                    type="text"
                    className="w-full text-base px-4 py-2 border border-neutral-200 rounded-md"
                  />
                </div>
              </div>
            ) : (
              <p className="text-base font-medium ">180 lbs</p>
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col items-center gap-4 py-4">
        <div className="w-full flex items-center justify-between gap-2">
          <p className="text-lg font-medium">Activity & History</p>
        </div>
        <div className="w-full grid grid-cols-1 min-[425px]:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className=" flex flex-col items-start grow border border-neutral-200 rounded-md p-4">
            <p className="text-base text-neutral-400">Date Account Created</p>
            <p className="text-base font-medium ">January 1, 2020</p>
          </div>
          <div className=" flex flex-col items-start grow border border-neutral-200 rounded-md p-4">
            <p className="text-base text-neutral-400">Last Login</p>
            <p className="text-base font-medium ">January 1, 2024</p>
          </div>
          <div className=" flex flex-col items-start grow border border-neutral-200 rounded-md p-4">
            <p className="text-base text-neutral-400">Total Workouts Created</p>
            <p className="text-base font-medium ">150</p>
          </div>
          <div className=" flex flex-col items-start grow border border-neutral-200 rounded-md p-4">
            <p className="text-base text-neutral-400">
              Total Workouts Completed
            </p>
            <p className="text-base font-medium ">120</p>
          </div>
          <div className=" flex flex-col items-start grow border border-neutral-200 rounded-md p-4">
            <p className="text-base text-neutral-400">Highest Workout Streak</p>
            <p className="text-base font-medium ">30 days</p>
          </div>
          <div className=" flex flex-col items-start grow border border-neutral-200 rounded-md p-4">
            <p className="text-base text-neutral-400">Total Workout Time</p>
            <p className="text-base font-medium ">500 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
