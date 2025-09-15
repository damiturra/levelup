// points.js - Sistema de puntos y niveles

window.PointSystem = {
    // Calcular puntos por compra (1 punto por cada $1000)
    calculatePoints: function(amount) {
        return Math.floor(amount / 1000);
    },

    // Añadir puntos al usuario
    addPoints: function(email, amount) {
        if (!email) return;
        
        const points = this.calculatePoints(amount);
        const profileKey = 'profile_' + email;
        
        // Obtener perfil actual
        const profile = JSON.parse(localStorage.getItem(profileKey) || 'null') || {
            points: 0,
            preferences: {
                notifications: true,
                newsletter: false,
                shareActivity: true
            }
        };

        // Actualizar puntos
        profile.points = (profile.points || 0) + points;

        // Guardar perfil actualizado
        localStorage.setItem(profileKey, JSON.stringify(profile));

        return points;
    },

    // Obtener nivel actual
    getLevel: function(points) {
        if (points >= 5000) return { name: 'Oro', badge: 'badge-gold' };
        if (points >= 1000) return { name: 'Plata', badge: 'badge-silver' };
        return { name: 'Bronce', badge: 'badge-bronze' };
    }
};
