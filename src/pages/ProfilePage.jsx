import React, { useState } from 'react';
import { useUserActions } from '../hooks/useUserActions';
import ProfileHeader from './profile/ProfileHeader';
import ProfileResume from './profile/ProfileResume';
import ProfileSkills from './profile/ProfileSkills';
import ProfileExperience from './profile/ProfileExperience';
import ProfileProjects from './profile/ProfileProjects';
import '../styles/profile.css';

export default function ProfilePage({
    user, profile, setProfile, users, viewedUserId,
    projects, handleProjectClick, showToast, customPrompt, userRole
}) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const {
        handleUpdateProfile: updateProfile,
        handleAddSkill,
        handleRemoveSkill,
        handleAddExperience,
        handleRemoveExperience,
        handleFileUpload: uploadFile
    } = useUserActions(user, profile, setProfile, showToast, customPrompt);

    const handleUpdateProfile = async (e) => {
        const success = await updateProfile(e);
        if (success) setIsEditingProfile(false);
    };

    const handleFileUpload = async (file) => {
        await uploadFile(file, setUploadProgress, setIsUploading);
    };

    const isOwnProfile = !viewedUserId || viewedUserId === user?.uid || (profile?.uid && viewedUserId === profile.uid);
    const displayProfile = isOwnProfile ? profile : (users[viewedUserId] || {});

    return (
        <div className="profile-view view-fade-in">
            <ProfileHeader 
                displayProfile={displayProfile}
                isOwnProfile={isOwnProfile}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                handleUpdateProfile={handleUpdateProfile}
                user={user}
                userRole={userRole}
            />

            {displayProfile?.role !== 'company' && displayProfile?.role !== 'admin' && (
                <div className="profile-sections-grid">
                    <ProfileResume 
                        displayProfile={displayProfile}
                        isOwnProfile={isOwnProfile}
                        user={user}
                        userRole={userRole}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        handleFileUpload={handleFileUpload}
                    />

                    <ProfileSkills 
                        technicalSkills={displayProfile.technicalSkills}
                        isOwnProfile={isOwnProfile}
                        onAddSkill={handleAddSkill}
                        onRemoveSkill={handleRemoveSkill}
                    />

                    <ProfileExperience 
                        experience={displayProfile.academicExperience}
                        isOwnProfile={isOwnProfile}
                        onAddExp={handleAddExperience}
                        onRemoveExp={handleRemoveExperience}
                    />

                    <ProfileProjects 
                        projects={projects}
                        isOwnProfile={isOwnProfile}
                        viewedUserId={viewedUserId}
                        user={user}
                        displayProfile={displayProfile}
                        handleProjectClick={handleProjectClick}
                    />
                </div>
            )}
        </div>
    );
}
