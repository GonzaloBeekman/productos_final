const LogoutButton = ({ onLogout }) => (
    <TouchableOpacity onPress={onLogout}>
      <Text>Cerrar sesión</Text>
    </TouchableOpacity>
  );