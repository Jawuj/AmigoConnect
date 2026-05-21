import React, { useMemo, useState } from 'react';
import UserCard from '../components/users/UserCard';
import Icons from '../components/shared/Icons';
import CustomSelect from '../components/shared/CustomSelect';
import '../styles/projects.css'; 

export default function UsersPage({ users, projects, searchQuery, setViewedUserId, setActiveView }) {
    const [selectedFaculty, setSelectedFaculty] = useState('Todas');
    const [selectedSemester, setSelectedSemester] = useState('Todos');
    const [selectedExpertise, setSelectedExpertise] = useState('Todas');

    const faculties = [
        { value: 'Todas', label: 'Todas las Facultades' },
        { value: 'Tecnología', label: 'Tecnología' },
        { value: 'Ingeniería', label: 'Ingeniería' },
        { value: 'Diseño', label: 'Diseño' },
        { value: 'Administración', label: 'Administración' }
    ];

    const semesters = [
        { value: 'Todos', label: 'Cualquier Semestre' },
        ...Array.from({ length: 10 }, (_, i) => ({ value: (i + 1).toString(), label: `Semestre ${i + 1}` }))
    ];

    const expertiseOptions = [
        { value: 'Todas', label: 'Todas las Especialidades' },
        { value: 'IoT', label: 'Internet de las Cosas (IoT)' },
        { value: 'Salud', label: 'Salud y Bienestar' },
        { value: 'Ciberseguridad', label: 'Ciberseguridad' },
        { value: 'IA', label: 'Inteligencia Artificial' },
        { value: 'Blockchain', label: 'Blockchain' },
        { value: 'Desarrollo Web', label: 'Desarrollo Web' },
        { value: 'Mobile', label: 'Desarrollo Mobile' }
    ];

    const filteredUsers = useMemo(() => {
        const usersList = Object.values(users);
        const query = searchQuery.toLowerCase();
        
        // Count projects per user
        const usersWithStats = usersList.map(u => {
            const userProjects = projects.filter(p => p.authorId === u.uid);
            return {
                ...u,
                projectCount: userProjects.length
            };
        });

        // Sort by project count (descending)
        const sortedUsers = usersWithStats.sort((a, b) => b.projectCount - a.projectCount);

        return sortedUsers.filter(u => {
            const isStudentOrGraduate = u.role === 'student' || u.role === 'graduate';
            if (!isStudentOrGraduate) return false;

            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
            const program = (u.program || '').toLowerCase();
            const skills = (u.technicalSkills || []).map(s => (s.nombre || s.name || (typeof s === 'string' ? s : '')).toLowerCase()).join(' ');
            const biography = (u.biography || '').toLowerCase();

            const matchSearch = !searchQuery || 
                               fullName.includes(query) || 
                               program.includes(query) || 
                               skills.includes(query) ||
                               biography.includes(query);

            const matchFaculty = selectedFaculty === 'Todas' || 
                                (u.faculty || '').toLowerCase().includes(selectedFaculty.toLowerCase()) ||
                                (u.program || '').toLowerCase().includes(selectedFaculty.toLowerCase());

            const matchSemester = selectedSemester === 'Todos' || String(u.semester) === selectedSemester;
            
            const matchExpertise = selectedExpertise === 'Todas' || 
                                 biography.includes(selectedExpertise.toLowerCase()) ||
                                 skills.includes(selectedExpertise.toLowerCase()) ||
                                 program.includes(selectedExpertise.toLowerCase());

            return matchSearch && matchFaculty && matchSemester && matchExpertise;
        });
    }, [users, projects, searchQuery, selectedFaculty, selectedSemester, selectedExpertise]);

    const handleUserClick = (uid) => {
        setViewedUserId(uid);
        setActiveView('profile');
    };

    const hasFilters = selectedFaculty !== 'Todas' || selectedSemester !== 'Todos' || selectedExpertise !== 'Todas';

    return (
        <div className="users-page-container view-fade-in main-content">
            <div className="section-header" style={{ marginBottom: '30px' }}>
                <div>
                    <h2 className="section-title">Talento Estudiantil</h2>
                    <p className="section-subtitle">Conecta con los mejores perfiles de la Universidad</p>
                </div>
                <div className="users-count-premium">
                    <span className="count-dot"></span>
                    <Icons.Users size={16} />
                    <strong>{filteredUsers.length}</strong>
                    <span>{filteredUsers.length === 1 ? 'Talento encontrado' : 'Talentos encontrados'}</span>
                </div>
            </div>

            <div className="filters-container-premium">
                <div className="secondary-filters-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="filter-item-wrapper">
                        <label className="filter-label-minimal"><Icons.Filter size={14} /> Facultad</label>
                        <CustomSelect 
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                            options={faculties}
                            placeholder="Todas las Facultades"
                            variant="navbar"
                        />
                    </div>
                    <div className="filter-item-wrapper">
                        <label className="filter-label-minimal"><Icons.Clock size={14} /> Semestre</label>
                        <CustomSelect 
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            options={semesters}
                            placeholder="Cualquier Semestre"
                            variant="navbar"
                        />
                    </div>
                    <div className="filter-item-wrapper">
                        <label className="filter-label-minimal"><Icons.Cpu size={14} /> Especialidad</label>
                        <CustomSelect 
                            value={selectedExpertise}
                            onChange={(e) => setSelectedExpertise(e.target.value)}
                            options={expertiseOptions}
                            placeholder="Todas las Especialidades"
                            variant="navbar"
                        />
                    </div>
                    
                    {hasFilters && (
                        <div className="reset-filters-wrapper">
                            <button className="reset-filters-btn-premium" onClick={() => {
                                setSelectedFaculty('Todas');
                                setSelectedSemester('Todos');
                                setSelectedExpertise('Todas');
                            }}>
                                <Icons.X size={14} />
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <Icons.Search />
                    <p>No se encontraron talentos con estos criterios.</p>
                </div>
            ) : (
                <div className="project-grid">
                    {filteredUsers.map(u => (
                        <UserCard 
                            key={u.uid} 
                            user={u} 
                            onClick={() => handleUserClick(u.uid)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
