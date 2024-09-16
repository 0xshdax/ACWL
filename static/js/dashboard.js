document.addEventListener('DOMContentLoaded', () => {
    const userRole = window.userRole || 'guest';

    const createMenu = () => {
        const menuContainer = document.getElementById('menu-container');
        const menuItems = [
            { text: 'Dashboard', url: '/backend/dashboard', icon: 'fas fa-tachometer-alt' },
            { text: 'Inventory', url: '/backend/inventory', icon: 'fas fa-list' },
            { text: 'Setting', url: '/backend/setting', icon: 'fas fa-cogs' }
        ];

        if (userRole === 'admin') {
            menuItems.push({ text: 'Admin Portal', url: '#', icon: 'fas fa-user-shield' });
        }

        const currentPath = window.location.pathname;

        menuItems.forEach(item => {
            if (item.url === '#') {
                const dropdown = document.createElement('div');
                dropdown.className = 'dropdown';

                const link = document.createElement('a');
                link.href = '#';
                link.id = item.id || ''; // Use empty string if id is not provided
                link.className = 'admin-menu';
                link.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
                link.onclick = (event) => {
                    event.preventDefault();
                    toggleAdminSubmenu();
                };

                const submenu = document.createElement('div');
                submenu.className = 'submenu';
                submenu.id = 'admin-submenu';

                const adminLinks = [
                    { text: 'User Management', url: '/backend/admin/users-management', icon: 'fas fa-users-cog' },
                    { text: 'Audit Logs', url: '/backend/admin/audit-logs', icon: 'fas fa-clipboard-list' }
                ];

                adminLinks.forEach(subItem => {
                    const subLink = document.createElement('a');
                    subLink.innerHTML = `<i class="${subItem.icon}"></i> ${subItem.text}`;
                    subLink.href = subItem.url;
                    subLink.className = subItem.url === currentPath ? 'active' : '';
                    submenu.appendChild(subLink);
                });

                dropdown.appendChild(link);
                dropdown.appendChild(submenu);
                menuContainer.appendChild(dropdown);
            } else {
                const a = document.createElement('a');
                a.className = 'nav-link';
                a.id = item.id || ''; // Use empty string if id is not provided
                a.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
                a.href = item.url;
                a.classList.toggle('active', item.url === currentPath);
                a.onclick = (event) => {
                    event.preventDefault();
                    navigateTo(item.url);
                };
                menuContainer.appendChild(a);
            }
        });
    };

    const navigateTo = (url) => {
        window.location.href = url;
    };

    const toggleAdminSubmenu = () => {
        const submenu = document.getElementById('admin-submenu');
        if (submenu) {
            submenu.classList.toggle('show');
        } else {
            console.error('Admin submenu not found');
        }
    };

    const loadInventoryTable = async () => {
        try {
            const response = await fetch('/api/v2/inventory');
            if (!response.ok) throw new Error('Failed to fetch inventory data');

            const inventoryData = await response.json();

            const tableBody = document.getElementById('inventory-table-body');
            tableBody.innerHTML = '';

            inventoryData.forEach(item => {
                const row = document.createElement('tr');

                ['name', 'product', 'available', 'category'].forEach(field => {
                    const cell = document.createElement('td');
                    cell.textContent = item[field];
                    row.appendChild(cell);
                });

                const priceCell = document.createElement('td');
                priceCell.textContent = `$${item.price.toFixed(2)}`;
                row.appendChild(priceCell);

                const actionCell = document.createElement('td');
                const editIcon = document.createElement('i');
                editIcon.className = 'fas fa-edit';
                editIcon.style.marginRight = '10px';
                editIcon.onclick = () => openEditPopup(item);

                const deleteIcon = document.createElement('i');
                deleteIcon.className = 'fas fa-trash-alt';
                deleteIcon.onclick = () => deleteItem(item.id);

                actionCell.appendChild(editIcon);
                actionCell.appendChild(deleteIcon);
                row.appendChild(actionCell);

                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading inventory table:', error);
        }
    };

    const openEditPopup = (item) => {
        if (userRole === 'admin') {
            document.getElementById('item-id').value = item.id;
            document.getElementById('name').value = item.name;
            document.getElementById('product').value = item.product;
            document.getElementById('available').value = item.available;
            document.getElementById('category').value = item.category;
            document.getElementById('price').value = item.price;

            document.getElementById('edit-popup').style.display = 'flex';
        } else {
            alert('You do not have permission to edit this item.');
        }
    };

    const deleteItem = (id) => {
        if (userRole === 'admin') {
            alert("This feature is still in development.");
        } else {
            alert('You do not have permission to delete this item.');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/v2/users');
            if (!response.ok) throw new Error('Failed to fetch users');

            const usersData = await response.json();

            const tableBody = document.getElementById('user-table-body');
            tableBody.innerHTML = '';

            usersData.forEach(user => {
                const row = document.createElement('tr');

                ['id', 'first_name', 'last_name', 'email', 'role'].forEach(field => {
                    const cell = document.createElement('td');
                    cell.textContent = user[field];
                    row.appendChild(cell);
                });

                const statusCell = document.createElement('td');
                statusCell.textContent = user.status === 1 ? 'Active' : 'Inactive';
                row.appendChild(statusCell);

                const actionCell = document.createElement('td');

                const editIcon = document.createElement('i');
                editIcon.className = 'fas fa-edit';
                editIcon.style.marginRight = '10px';
                editIcon.onclick = () => editUser(user.id);
                
                const deleteIcon = document.createElement('i');
                deleteIcon.className = 'fas fa-trash-alt';
                deleteIcon.onclick = () => deleteUser(user.id);

                actionCell.appendChild(editIcon);
                actionCell.appendChild(deleteIcon);
                row.appendChild(actionCell);

                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const editUser = (userId) => {
        if (userRole === 'admin') {
            alert("This feature is still in development.");
        } else {
            alert('You do not have permission to edit this user.');
        }
    };

    const deleteUser = async (userId) => {
        if (userRole === 'admin') {
            alert("This feature is still in development.");
        } else {
            alert('You do not have permission to delete this user.');
        }
    };

    window.onclick = (e) => {
        if (!e.target.matches('.avatar-label img')) {
            const dropdowns = document.getElementsByClassName("logout-dropdown");
            Array.from(dropdowns).forEach(dropdown => {
                dropdown.classList.remove("show");
            });
        }
    };

    createMenu();
    loadInventoryTable();
    fetchUsers();
});

const closePopup = () => {
    document.getElementById('edit-popup').style.display = 'none';
};

document.getElementById('edit-form').onsubmit = async (event) => {
    event.preventDefault();

    const id = document.getElementById('item-id').value;
    const name = document.getElementById('name').value;
    const product = document.getElementById('product').value;
    const available = document.getElementById('available').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;

    try {
        const response = await fetch('/api/v2/inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                name: name,
                product: product,
                available: available,
                category: category,
                price: price
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            closePopup();
            location.reload();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Failed to update item:', error);
    }
};