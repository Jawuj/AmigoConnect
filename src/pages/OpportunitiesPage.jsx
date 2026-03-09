import React, { useState } from 'react';
import Icons from '../components/shared/Icons';
import OpportunityCard from '../components/opportunities/OpportunityCard';

export default function OpportunitiesPage({
    opportunities, profile, userRole, user,
    setIsOppModalOpen, handleToggleFavorite
}) {
    const [activeOppTab, setActiveOppTab] = useState('all');

    const isFavorite = (id) => profile?.favorites?.includes(id);

    const visibleOpps = opportunities.filter(o => {
        const matchFavorites = activeOppTab === 'all' || (activeOppTab === 'favorites' && isFavorite(o.id));
        if (!matchFavorites) return false;

        if (userRole === 'teacher') return true;
        if (user?.uid === o.companyId) return true;
        if (o.approvalStatus === 'approved') return true;
        return false;
    });

    return (
        <div className="opportunities-view">
            <div className="section-header">
                <h2 className="section-title">Oportunidades Laborales</h2>
                <div className="header-actions-row">
                    <div className="view-tabs">
                        <button
                            className={`view-tab ${activeOppTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveOppTab('all')}
                        >Todas</button>
                        <button
                            className={`view-tab ${activeOppTab === 'favorites' ? 'active' : ''}`}
                            onClick={() => setActiveOppTab('favorites')}
                        >Mis Favoritas ⭐</button>
                    </div>
                    {userRole === 'company' && (
                        <button className="primary-action-btn" onClick={() => setIsOppModalOpen(true)}>
                            <Icons.Plus /> Publicar Vacante
                        </button>
                    )}
                </div>
            </div>

            <div className="opps-grid">
                {visibleOpps.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay vacantes aprobadas en este momento.</p>
                    </div>
                ) : (
                    visibleOpps.map(opp => (
                        <OpportunityCard
                            key={opp.id}
                            opp={opp}
                            profile={profile}
                            userRole={userRole}
                            user={user}
                            handleToggleFavorite={handleToggleFavorite}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
