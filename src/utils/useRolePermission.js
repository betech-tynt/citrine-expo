import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROLE_STAFF, ROLE_STAFF_MANAGER } from '../constants/utils';

const useRolePermission = () => {
    const [userRole, setUserRole] = useState(null);
    const [canViewRegister, setCanViewRegister] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [canAccessHR, setCanAccessHR] = useState(false);

    useEffect(() => {
        async function fetchUserInfo() {
            // Retrieve role code and user information from AsyncStorage
            const [roleCode, userInfo] = await Promise.all([
                AsyncStorage.getItem('userRoleCode'),
                AsyncStorage.getItem('userInfo'),
            ]);

            const normalizedRoleCode = roleCode
                ? String(roleCode).trim().toUpperCase()
                : null;

            if (normalizedRoleCode) {
                setUserRole(normalizedRoleCode);

                // Admin = staff manager
                setIsAdmin(normalizedRoleCode === ROLE_STAFF_MANAGER);

                // HR access: staff or staff manager
                setCanAccessHR(
                    normalizedRoleCode === ROLE_STAFF ||
                        normalizedRoleCode === ROLE_STAFF_MANAGER,
                );
            }

            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                const permissions = parsedUser.permissions || [];

                // Check if the user has the "cleaning" permission
                const hasCleaningPermission = permissions.some(
                    perm => perm.name === 'cleaning', // check by `name`
                );

                // Set permission for viewing the register
                setCanViewRegister(hasCleaningPermission);
            }
        }

        fetchUserInfo();
    }, []);

    return { userRole, isAdmin, canViewRegister, canAccessHR };
};

export default useRolePermission;
