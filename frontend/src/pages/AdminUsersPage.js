import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './AdminUsersPage.module.css';

const ROLES = ['user', 'venue_owner', 'admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/users?${params}`);
      setUsers(r.data.users);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const r = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(us => us.map(u => u._id === userId ? { ...u, role: r.data.user.role } : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(us => us.map(u => u._id === userId ? { ...u, isActive: false } : u));
      toast.success('User deactivated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <div>
            <h1>User Management</h1>
            <p>{total} total users</p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.toolbar}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>Search</button>
            {search && (
              <button type="button" className={styles.clearBtn} onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
                Clear
              </button>
            )}
          </form>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loading}>Loading users…</div>
          ) : users.length === 0 ? (
            <div className={styles.empty}>No users found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className={!u.isActive ? styles.rowInactive : ''}>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>{u.firstName?.charAt(0)}</div>
                        <span>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className={styles.email}>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        disabled={updatingId === u._id}
                        className={`${styles.roleSelect} ${styles[`role_${u.role}`]}`}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className={styles.date}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                    <td>
                      <span className={`${styles.badge} ${u.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {u.isActive && (
                        <button className={styles.deleteBtn} onClick={() => setConfirmDelete(u)}>
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className={styles.pagination}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
            <span className={styles.pageInfo}>Page {page} of {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Deactivate User</h3>
            <p>Are you sure you want to deactivate <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong>? They won't be able to log in.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelModalBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(confirmDelete._id)}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
