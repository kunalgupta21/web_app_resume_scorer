import React, { useState, useEffect } from "react";
import { Button, Form, message, Spin, Tabs } from "antd";
import Personalinfo from "../components/Personalinfo";
import SkillsEducation from "../components/SkillsEducation";
import ExperienceProjects from "../components/experienceProjects";
import Certificates from "../components/Certificates";
import Interests from "../components/Interests";
import axios from "axios";
import Header from "../components/Header";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch profile when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/user/profile",
          { withCredentials: true }
        );

        setUserData(response.data);
        localStorage.setItem("resume-user", JSON.stringify(response.data));
      } catch (error) {
        message.error("Failed to fetch profile data");
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, []);

  // Submit updated profile data
  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/user/update",
        values,
        { withCredentials: true }
      );

      message.success("Profile updated successfully");
      setUserData(values);
      localStorage.setItem("resume-user", JSON.stringify(values));
    } catch (error) {
      message.error("Profile update failed");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row home">
      <Header />
      <br />
      <br />
      <br />

      <div className="row profile">
        {loading && <Spin size="large" />}

        <div className="update-profile">
          <h2>
            <b>Update Profile</b>
          </h2>
          <hr />

          {userData ? (
            <Form
              layout="vertical"
              onFinish={onFinish}
              initialValues={userData}
            >
              <Tabs
                defaultActiveKey="1"
                items={[
                  {
                    label: "Personal Info",
                    key: "1",
                    children: <Personalinfo />,
                  },
                  {
                    label: "Skills and Education",
                    key: "2",
                    children: <SkillsEducation />,
                  },
                  {
                    label: "Experience / Projects",
                    key: "3",
                    children: <ExperienceProjects />,
                  },
                  {
                    label: "Certificates / Courses",
                    key: "4",
                    children: <Certificates />,
                  },
                  {
                    label: "Co-curricular / Interests",
                    key: "5",
                    children: <Interests />,
                  },
                ]}
              />

              <Button htmlType="submit" className="btnupdt">
                UPDATE
              </Button>
            </Form>
          ) : (
            <Spin size="large" />
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
